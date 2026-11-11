"""الاختبار بمتصفح آلي (Playwright)، إصلاح حالة الأحرف، وفحص JavaScript."""
import json
import os
import re
import shutil
import subprocess
import threading
from pathlib import Path
from urllib.parse import unquote, urlparse

from common import COUNT, EXCLUDE_DIRS, _STAGE, log, run

# ───────────── هل هي لعبة؟ (تقبل إدخالاً من اللاعب) ─────────────
# نحقن سكربتاً قبل كل صفحة وإطار يسجّل أنواع أحداث الإدخال التي تسجّلها الصفحة (لمس، نقر، مفاتيح، فأرة، يد تحكم، حسّاس حركة)
# سواء عبر addEventListener أو خصائص on*. صفحة تعرض حركة فقط (مثل مطر Matrix) لا تسجّل شيئاً منها، فتُرفض بوصفها ليست لعبة.
INPUT_EVENTS = ["click", "dblclick", "mousedown", "mouseup", "mousemove", "pointerdown", "pointerup", "pointermove",
                "touchstart", "touchend", "touchmove", "keydown", "keyup", "keypress", "wheel", "contextmenu",
                "gamepadconnected", "deviceorientation", "devicemotion", "dragstart", "input", "change", "submit"]
INPUT_HOOK_JS = """
(() => {
  const EV = %s;
  const seen = (window.__inputSeen = window.__inputSeen || {});
  const mark = t => { if (EV.includes(t)) seen[t] = 1; };
  try {
    const orig = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (t, ...r) { try { mark(String(t)); } catch (e) {} return orig.call(this, t, ...r); };
  } catch (e) {}
})();
""" % json.dumps(INPUT_EVENTS)

INPUT_COLLECT_JS = """
() => {
  const EV = %s;
  const seen = Object.assign({}, window.__inputSeen || {});
  const holders = [window, document, document.documentElement, document.body];
  for (const h of holders) { if (!h) continue; for (const t of EV) { try { if (h['on' + t]) seen[t] = 1; } catch (e) {} } }
  let els = 0;
  for (const el of document.querySelectorAll('*')) {
    for (const t of EV) { try { if (el['on' + t]) { seen[t] = 1; } } catch (e) {} }
    const tag = el.tagName;
    if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || el.getAttribute('role') === 'button') els++;
  }
  return {types: Object.keys(seen), els};
}
""" % json.dumps(INPUT_EVENTS)


# ───────────── الغلاف ─────────────
COVER_RE = re.compile(r"(cover|thumb|thumbnail|banner|preview|splash|og[-_]?image|icon|logo)", re.I)


def pick_cover(site: Path, src: Path):
    cands = []
    for base in (site, src):
        for dp, dns, fns in os.walk(base):
            dns[:] = [d for d in dns if d not in EXCLUDE_DIRS]
            for fn in fns:
                if fn.lower().endswith((".png", ".jpg", ".jpeg", ".webp")) and COVER_RE.search(fn):
                    p = Path(dp) / fn
                    sz = p.stat().st_size
                    if 8_000 <= sz <= 2_500_000:
                        score = sz + (10_000_000 if "cover" in fn.lower() or "thumb" in fn.lower() else 0)
                        cands.append((score, p))
        if cands:
            break
    if not cands:
        return None
    cands.sort(reverse=True)
    return cands[0][1]


# ───────────── اختبار بمتصفح آلي ─────────────
EXPLORE_KEYS = ["Space", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
                "KeyW", "KeyA", "KeyS", "KeyD", "KeyZ", "KeyX", "Escape"]


def _explore(page, w=412, h=915, seconds=45):
    """لاعب آلي عشوائي (monkey test): يلمس ويسحب ويضغط مفاتيح، ويسرّع الزمن الافتراضي للصفحة
    بـ clock.run_for (مؤقتات وrequestAnimationFrame تُنفَّذ فوراً) ليغطي وقتاً لعبياً أطول بكثير من الوقت الحقيقي.
    البذرة ثابتة كي تتشابه جولات المقارنة. لا يستطيع إنهاء مراحل بذكاء؛ هو يوسّع التغطية فقط."""
    import random
    import time
    rnd = random.Random(7)
    t0 = time.time()
    has_clock = hasattr(page, "clock")
    if has_clock:
        try:
            page.clock.install()
        except Exception:
            has_clock = False
    virtual_ms = 0
    try:
        while time.time() - t0 < seconds:
            r = rnd.random()
            if r < 0.45:
                page.touchscreen.tap(rnd.randint(10, w - 10), rnd.randint(10, h - 10))
            elif r < 0.70:
                page.keyboard.press(rnd.choice(EXPLORE_KEYS))
            else:
                x1, y1 = rnd.randint(30, w - 30), rnd.randint(60, h - 60)
                x2, y2 = rnd.randint(30, w - 30), rnd.randint(60, h - 60)
                page.mouse.move(x1, y1)
                page.mouse.down()
                page.mouse.move(x2, y2, steps=6)
                page.mouse.up()
            step = rnd.randint(800, 2500)
            if has_clock:
                try:
                    page.clock.run_for(step)  # يشغّل step ملّي ثانية افتراضية دفعة واحدة
                    virtual_ms += step
                except Exception:
                    has_clock = False
            page.wait_for_timeout(250 if has_clock else step)
    except Exception:
        pass
    return virtual_ms


_CLICK_JS = """(skip) => {
  const good = /play|start|begin|enter|new game|vs|player|single|solo|ابدأ|ابدا|العب|بدء|لعب|ابتدئ|تشغيل/i;
  const bad = /download|github|donate|rate|share|exit|quit|setting|sound|music|mute|about|help|credit|privacy|تحميل|مشاركة|خروج|إعدادات|اعدادات|صوت/i;
  const els = [...document.querySelectorAll('button,a,[role=button],input[type=button],input[type=submit],.btn,.button,[onclick]')];
  const out = [];
  for (const e of els) {
    const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
    if (r.width < 24 || r.height < 18 || r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) continue;
    if (s.visibility === 'hidden' || s.display === 'none' || s.pointerEvents === 'none' || +s.opacity === 0) continue;
    const t = ((e.innerText || e.value || e.getAttribute('aria-label') || '') + '').trim().slice(0, 60);
    if (bad.test(t)) continue;
    if (e.tagName === 'A') { const h = e.getAttribute('href') || ''; if (/^https?:|^mailto:/i.test(h)) continue; }
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if ((skip || []).some(p => Math.abs(p[0] - cx) < 6 && Math.abs(p[1] - cy) < 6)) continue;
    out.push({x: cx, y: cy, g: good.test(t) ? 1 : 0, a: r.width * r.height});
  }
  if (!out.length) return null;
  out.sort((p, q) => q.g - p.g || q.a - p.a);
  return [out[0].x, out[0].y];
}"""

_CANVAS_JS = """() => {
  let best = null, ba = 0;
  for (const c of document.querySelectorAll('canvas')) {
    const r = c.getBoundingClientRect();
    if (r.width < 200 || r.height < 200 || r.bottom <= 0 || r.top >= innerHeight) continue;
    if (r.width * r.height > ba) { ba = r.width * r.height; best = c; }
  }
  if (!best) return false;
  best.setAttribute('data-kh-cv', '1'); return true;
}"""


def _extra_shots(page, shots_dir: Path):
    """لقطات إضافية لاختيار غلاف بديل: بعد الضغط على أول زر مناسب (مرتين)، بعد Enter/Space، وللوحة الرسم الكبيرة."""
    shots_dir.mkdir(parents=True, exist_ok=True)
    got = []

    def snap(name):
        p = shots_dir / name
        try:
            page.screenshot(path=str(p))
            got.append(str(p))
        except Exception:
            pass

    try:
        clicked = []
        for i in (1, 2, 3):
            pos = page.evaluate(_CLICK_JS, clicked)
            if not pos:
                break
            clicked.append(pos)
            page.touchscreen.tap(pos[0], pos[1])
            page.wait_for_timeout(2500)
            snap(f"_s_click{i}.png")
        for k, name in (("Enter", "_s_enter.png"), ("Space", "_s_space.png")):
            page.keyboard.press(k)
            page.wait_for_timeout(1800)
            snap(name)
        if page.evaluate(_CANVAS_JS):
            p = shots_dir / "_s_canvas.png"
            try:
                page.locator("canvas[data-kh-cv]").first.screenshot(path=str(p), timeout=4000)
                got.append(str(p))
            except Exception:
                pass
    except Exception:
        pass
    return got


def _landscape_shot(port, shots_dir: Path):
    """لقطة بوضع أفقي (ألعاب كثيرة مصمّمة للعرض الأفقي وتبدو فارغة بالعمودي)."""
    try:
        from playwright.sync_api import sync_playwright
        shots_dir.mkdir(parents=True, exist_ok=True)
        p = shots_dir / "_s_land.png"
        with sync_playwright() as pw:
            b = pw.chromium.launch(args=["--no-sandbox"])
            ctx = b.new_context(viewport={"width": 915, "height": 412}, device_scale_factor=2,
                                is_mobile=True, has_touch=True)
            pg = ctx.new_page()
            pg.goto(f"http://127.0.0.1:{port}/game/index.html", wait_until="load", timeout=30000)
            pg.wait_for_timeout(5000)
            pos = pg.evaluate(_CLICK_JS, [])
            if pos:
                pg.touchscreen.tap(pos[0], pos[1])
                pg.wait_for_timeout(2500)
            pg.screenshot(path=str(p))
            b.close()
        return [str(p)]
    except Exception:
        return []


def browser_test(site: Path, work: Path, shot: Path, explore=False, seconds=45, shots=False):
    COUNT["browser_tests"] += 1
    log(f"🌐 اختبار متصفح رقم {COUNT['browser_tests']} (المرحلة: {_STAGE['name']})")
    res = {"ran": False, "console_errors": [], "failed_requests": [], "status_ok": False,
           "blank": False, "external_requests": [], "missing": [], "used": [],
           "input_events": [], "interactive_els": 0, "keyboard_only": False}
    try:
        from playwright.sync_api import sync_playwright
    except Exception:
        return res
    import http.server
    import functools

    serve = work / "serve"
    if serve.exists():
        shutil.rmtree(serve)
    serve.mkdir(parents=True)
    os.symlink(site.resolve(), serve / "game")

    class H(http.server.SimpleHTTPRequestHandler):
        extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                          ".wasm": "application/wasm", ".js": "text/javascript",
                          ".mjs": "text/javascript", ".json": "application/json"}

        def log_message(self, *a):
            pass

    handler = functools.partial(H, directory=str(serve))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    try:
        with sync_playwright() as pw:
            b = pw.chromium.launch(args=["--no-sandbox"])
            ctx = b.new_context(viewport={"width": 412, "height": 915}, device_scale_factor=2,
                                is_mobile=True, has_touch=True)
            ctx.add_init_script(INPUT_HOOK_JS)
            page = ctx.new_page()
            page.on("console", lambda m: res["console_errors"].append(m.text[:200]) if m.type == "error" else None)
            page.on("pageerror", lambda e: res["console_errors"].append(("JS: " + str(e))[:200]))
            page.on("requestfailed", lambda r: res["failed_requests"].append(r.url[:150]))
            used = set()

            def on_req(r):
                u = r.url
                if u.startswith(f"http://127.0.0.1:{port}/game/"):
                    used.add(unquote(urlparse(u).path[len("/game/"):]))

            page.on("request", on_req)

            def on_resp(r):
                u = r.url
                if r.status >= 400:
                    res["failed_requests"].append(f"{r.status} {u[:140]}")
                    if r.status == 404 and u.startswith(f"http://127.0.0.1:{port}/game/"):
                        res["missing"].append(urlparse(u).path[len("/game/"):])
                if not u.startswith(f"http://127.0.0.1:{port}"):
                    res["external_requests"].append(u.split("/")[2] if "//" in u else u)

            page.on("response", on_resp)
            resp = page.goto(f"http://127.0.0.1:{port}/game/index.html", wait_until="load", timeout=45000)
            res["status_ok"] = bool(resp and resp.status == 200)
            page.wait_for_timeout(6000)
            try:
                page.screenshot(path=str(shot.with_name("_title.png")))  # لقطة الشاشة الأولى (احتياطي للغلاف)
            except Exception:
                pass
            if shots:
                res["extra_shots"] = _extra_shots(page, work / "shots")
            if explore:
                res["virtual_ms"] = _explore(page, 412, 915, seconds)
            info = page.evaluate(
                "() => ({n: document.querySelectorAll('canvas,svg,img,video,iframe,button').length,"
                " t: (document.body ? document.body.innerText : '').trim().length})")
            res["blank"] = info["n"] == 0 and info["t"] < 5
            try:
                ev, els = set(), 0
                for fr in page.frames:
                    try:
                        c = fr.evaluate(INPUT_COLLECT_JS)
                        ev.update(c["types"])
                        els += c["els"]
                    except Exception:
                        pass
                res["input_events"] = sorted(ev)
                res["interactive_els"] = els
                pointer = {"click", "dblclick", "mousedown", "mouseup", "mousemove", "pointerdown", "pointerup",
                           "pointermove", "touchstart", "touchend", "touchmove"}
                kbd = {"keydown", "keyup", "keypress"}
                # لوحة مفاتيح فقط: تسجّل مفاتيح ولا تسجّل لمساً ولا فأرة ولا نقراً، وليس فيها أزرار على الصفحة
                res["keyboard_only"] = bool(ev & kbd) and not (ev & pointer) and els == 0
            except Exception:
                res["input_events"] = None  # تعذّر الفحص: لا نحكم
            page.screenshot(path=str(shot))
            res["used"] = sorted(used)
            b.close()
        if shots:
            res.setdefault("extra_shots", []).extend(_landscape_shot(port, work / "shots"))
        res["ran"] = True
    except Exception as e:
        res["console_errors"].append(f"فشل الاختبار الآلي: {str(e)[:200]}")
    finally:
        srv.shutdown()
    res["external_requests"] = sorted(set(res["external_requests"]))[:20]
    res["console_errors"] = res["console_errors"][:12]
    res["failed_requests"] = res["failed_requests"][:12]
    res["missing"] = list(dict.fromkeys(res["missing"]))[:400]
    res["used"] = res["used"][:5000]
    return res


# ───────────── إصلاح حالة الأحرف (Linux حساس لها، ويندوز لا) ─────────────
def fix_case(site: Path, missing):
    """ملف مطلوب باسم 'Assets/Hero.PNG' وموجود فعلاً باسم 'assets/hero.png': ننسخه بالاسم المطلوب.
    لا نلمس أي كود؛ نضيف نسخة فقط."""
    index = {}
    for dp, dns, fns in os.walk(site):
        for fn in fns:
            rel = str((Path(dp) / fn).relative_to(site)).replace(os.sep, "/")
            index.setdefault(rel.lower(), rel)
    n = 0
    root = site.resolve()
    for m in missing:
        m = unquote(m).lstrip("/")
        if not m or ".." in m.split("/"):
            continue
        real = index.get(m.lower())
        if not real or real == m:
            continue
        dest = site / m
        try:
            dest.resolve().relative_to(root)
        except ValueError:
            continue
        if not dest.exists():
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(site / real, dest)
            n += 1
        if n >= 300:
            break
    return n


# ───────────── فحص JavaScript بـ ESLint (تقرير فقط، لا يعدّل الكود) ─────────────
VENDOR_RE = re.compile(
    r"(\.min\.|jquery|phaser|three|pixi|howler|lodash|bootstrap|react|vue|angular|babylon|createjs|easeljs|"
    r"tweenjs|soundjs|preloadjs|box2d|matter|cannon|gsap|zepto|underscore|backbone|moment|konva|fabric|kaboom|"
    r"excalibur|melon|crafty|enchant|cocos|emscripten|unity|godot)", re.I)
LINT_RULES = {
    "no-func-assign": "error", "no-dupe-args": "error",
    "no-const-assign": "error", "no-import-assign": "error", "valid-typeof": "error",
    "use-isnan": "error", "no-unsafe-negation": "error",
    # أسلوبية/غير مؤثرة غالباً على التشغيل (مفتاح مكرر: الأخير يغلب ولا ينهار الكود): ملاحظات لا تحذيرات
    "no-dupe-keys": "warn", "no-dupe-else-if": "warn",
    "no-unreachable": "warn", "no-self-assign": "warn",
}


def lint_js(site: Path, work: Path):
    res = {"ran": False, "checked": 0, "skipped": 0, "errors": 0, "warnings": 0, "samples": []}
    scripts, modules = [], []
    for dp, dns, fns in os.walk(site):
        for fn in fns:
            if not fn.lower().endswith((".js", ".mjs")):
                continue
            p = Path(dp) / fn
            rel = str(p.relative_to(site)).replace(os.sep, "/")
            sz = p.stat().st_size
            if sz > 400 * 1024 or sz < 20 or VENDOR_RE.search(fn):
                res["skipped"] += 1
                continue
            txt = p.read_text(encoding="utf-8", errors="ignore")
            if sz / (txt.count("\n") + 1) > 200:  # سطور طويلة جداً = مصغّر
                res["skipped"] += 1
                continue
            is_mod = fn.lower().endswith(".mjs") or re.search(r"(?m)^\s*(import\s[^(]|export\s)", txt)
            (modules if is_mod else scripts).append(rel)
    res["checked"] = len(scripts) + len(modules)
    if not res["checked"]:
        return res
    lint_dir = work / "lint"
    lint_dir.mkdir(parents=True, exist_ok=True)
    try:
        run(["npm", "install", "--prefix", str(lint_dir), "eslint@9", "--no-audit", "--no-fund"], timeout=300)
    except Exception as e:
        res["error"] = f"تعذّر تثبيت ESLint: {str(e)[:80]}"
        return res
    eslint = lint_dir / "node_modules" / "eslint" / "bin" / "eslint.js"
    rules = json.dumps(LINT_RULES)
    for kind, files in (("script", scripts), ("module", modules)):
        if not files:
            continue
        cfg = lint_dir / f"cfg_{kind}.mjs"
        cfg.write_text(
            'export default [{files:["**/*.js","**/*.mjs"],'
            f'languageOptions:{{ecmaVersion:"latest",sourceType:"{kind}"}},rules:{rules}}}];\n',
            encoding="utf-8")
        for i in range(0, len(files), 80):
            chunk = files[i:i + 80]
            try:
                r = subprocess.run(["node", str(eslint), "-c", str(cfg), "-f", "json", "--no-warn-ignored", *chunk],
                                   cwd=site, capture_output=True, text=True, timeout=300)
                data = json.loads(r.stdout or "[]")
            except Exception:
                continue
            res["ran"] = True
            for f in data:
                for m in f.get("messages", []):
                    if m.get("severity") == 2:
                        res["errors"] += 1
                        if len(res["samples"]) < 8:
                            rel = os.path.relpath(f.get("filePath", ""), site)
                            res["samples"].append(f"{rel}:{m.get('line', '?')} {str(m.get('message', ''))[:80]}")
                    else:
                        res["warnings"] += 1
    return res
