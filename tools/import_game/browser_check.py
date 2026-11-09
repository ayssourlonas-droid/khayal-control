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


def browser_test(site: Path, work: Path, shot: Path, explore=False, seconds=45):
    COUNT["browser_tests"] += 1
    log(f"🌐 اختبار متصفح رقم {COUNT['browser_tests']} (المرحلة: {_STAGE['name']})")
    res = {"ran": False, "console_errors": [], "failed_requests": [], "status_ok": False,
           "blank": False, "external_requests": [], "missing": [], "used": []}
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
            if explore:
                res["virtual_ms"] = _explore(page, 412, 915, seconds)
            info = page.evaluate(
                "() => ({n: document.querySelectorAll('canvas,svg,img,video,iframe,button').length,"
                " t: (document.body ? document.body.innerText : '').trim().length})")
            res["blank"] = info["n"] == 0 and info["t"] < 5
            page.screenshot(path=str(shot))
            res["used"] = sorted(used)
            b.close()
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
