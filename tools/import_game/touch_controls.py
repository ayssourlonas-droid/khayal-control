"""ألعاب لا تستجيب إلا للوحة المفاتيح: نكشف المفاتيح التي تستعملها (بالنص البرمجي) ونضيف طبقة أزرار لمس
تولّد أحداث لوحة المفاتيح نفسها. الكشف تقريبي (بحث نصي)؛ إن لم نجد شيئاً نضع أسهماً وSpace وEnter.
لا نعدّل كود اللعبة: نضيف ملفاً `_touch_controls.js` وسطر script في index.html فقط."""
import json
import re
from pathlib import Path

MAX_SCAN = 6_000_000

# مفتاح -> (اسم العرض، key، code، keyCode)
KEYS = {
    "left": ("◀", "ArrowLeft", "ArrowLeft", 37),
    "up": ("▲", "ArrowUp", "ArrowUp", 38),
    "right": ("▶", "ArrowRight", "ArrowRight", 39),
    "down": ("▼", "ArrowDown", "ArrowDown", 40),
    "wl": ("◀", "a", "KeyA", 65),
    "wu": ("▲", "w", "KeyW", 87),
    "wr": ("▶", "d", "KeyD", 68),
    "wd": ("▼", "s", "KeyS", 83),
    "space": ("␣", " ", "Space", 32),
    "enter": ("⏎", "Enter", "Enter", 13),
    "z": ("Z", "z", "KeyZ", 90),
    "x": ("X", "x", "KeyX", 88),
    "shift": ("⇧", "Shift", "ShiftLeft", 16),
    "esc": ("⎋", "Escape", "Escape", 27),
}

_PATTERNS = {
    "arrows": r"Arrow(?:Left|Right|Up|Down)|\bkey(?:Code|code)?\s*[=!]==?\s*(?:37|38|39|40)\b|case\s+(?:37|38|39|40)\s*:|[{,]\s*(?:37|38|39|40)\s*:",
    "wasd": r"\bKey[WASD]\b|case\s+['\"][wasdWASD]['\"]\s*:|(?:\bkey|\bcode)\s*[=!]==?\s*['\"][wasdWASD]['\"]|(?:keyCode|which)\s*[=!]==?\s*(?:87|65|83|68)\b|case\s+(?:87|65|83|68)\s*:",
    "space": r"\bSpace\b|\bkey\s*[=!]==?\s*['\"] ['\"]|(?:keyCode|which)\s*[=!]==?\s*32\b|case\s+32\s*:|case\s+['\"] ['\"]\s*:",
    "enter": r"['\"]Enter['\"]|\bEnter\b|(?:keyCode|which)\s*[=!]==?\s*13\b|case\s+13\s*:",
    "z": r"\bKeyZ\b|case\s+['\"][zZ]['\"]\s*:|\bkey\s*[=!]==?\s*['\"][zZ]['\"]|(?:keyCode|which)\s*[=!]==?\s*90\b|case\s+90\s*:",
    "x": r"\bKeyX\b|case\s+['\"][xX]['\"]\s*:|\bkey\s*[=!]==?\s*['\"][xX]['\"]|(?:keyCode|which)\s*[=!]==?\s*88\b|case\s+88\s*:",
    "shift": r"\bShiftLeft\b|['\"]Shift['\"]|(?:keyCode|which)\s*[=!]==?\s*16\b|case\s+16\s*:|\bshiftKey\b",
    "esc": r"['\"]Escape['\"]|(?:keyCode|which)\s*[=!]==?\s*27\b|case\s+27\s*:",
}


def detect_keys(site: Path):
    """يرجع قائمة مفاتيح الواجهة (من KEYS) بالترتيب، مع ما وجده الكشف."""
    text, seen = [], 0
    for f in sorted(site.rglob("*")):
        if f.suffix.lower() not in (".js", ".mjs", ".html", ".htm") or not f.is_file():
            continue
        try:
            sz = f.stat().st_size
            if seen + sz > MAX_SCAN:
                continue
            text.append(f.read_text("utf-8", errors="ignore"))
            seen += sz
        except Exception:
            pass
    blob = "\n".join(text)
    found = {k for k, rx in _PATTERNS.items() if re.search(rx, blob)}
    keys = []
    if "arrows" in found:
        keys += ["left", "up", "right", "down"]
    elif "wasd" in found:
        keys += ["wl", "wu", "wr", "wd"]
    for k in ("space", "enter", "z", "x", "shift", "esc"):
        if k in found:
            keys.append(k)
    guessed = False
    if not keys:
        keys = ["left", "up", "right", "down", "space", "enter"]
        guessed = True
    return {"keys": keys, "found": sorted(found), "guessed": guessed}


JS_TEMPLATE = r"""/* أزرار لمس مدمجة: تولّد أحداث لوحة المفاتيح لألعاب لا تقبل غيرها. أُضيفت آلياً عند الاستيراد (لا تغيّر كود اللعبة). */
(function () {
  var KEYS = __KEYS__;
  var DIR = {left: 1, up: 1, right: 1, down: 1, wl: 1, wu: 1, wr: 1, wd: 1};
  function target() {
    var cs = document.querySelectorAll('canvas'), best = null, area = 0;
    for (var i = 0; i < cs.length; i++) { var r = cs[i].getBoundingClientRect(), a = r.width * r.height; if (a > area) { area = a; best = cs[i]; } }
    return best || document.activeElement || document.body;
  }
  function fire(type, k, repeat) {
    var e = new KeyboardEvent(type, {key: k[1], code: k[2], bubbles: true, cancelable: true, repeat: !!repeat, shiftKey: k[1] === 'Shift'});
    try { Object.defineProperty(e, 'keyCode', {get: function () { return k[3]; }}); Object.defineProperty(e, 'which', {get: function () { return k[3]; }}); } catch (x) {}
    target().dispatchEvent(e);
  }
  function build() {
    if (document.getElementById('__tc')) return;
    var coarse = false;
    try { coarse = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window; } catch (x) {}
    if (!coarse) return;
    var css = document.createElement('style');
    css.textContent = '#__tc{position:fixed;left:0;right:0;bottom:0;height:0;z-index:2147483000;pointer-events:none;font-family:sans-serif}' +
      '#__tc .g{position:fixed;bottom:max(14px,env(safe-area-inset-bottom));display:grid;gap:8px;pointer-events:none}' +
      '#__tc .d{left:14px;grid-template-columns:repeat(3,56px);grid-template-rows:repeat(2,56px)}' +
      '#__tc .a{right:14px;grid-template-columns:repeat(2,56px);justify-items:end}' +
      '#__tc button{pointer-events:auto;touch-action:none;user-select:none;-webkit-user-select:none;width:56px;height:56px;border-radius:50%;border:2px solid rgba(255,255,255,.55);background:rgba(20,20,30,.38);color:#fff;font-size:22px;font-weight:700;padding:0;opacity:.8}' +
      '#__tc button.on{background:rgba(160,80,255,.6)}';
    document.head.appendChild(css);
    var root = document.createElement('div'); root.id = '__tc';
    var d = document.createElement('div'); d.className = 'g d';
    var a = document.createElement('div'); a.className = 'g a';
    var pos = {up: [2, 1], wu: [2, 1], left: [1, 2], wl: [1, 2], down: [2, 2], wd: [2, 2], right: [3, 2], wr: [3, 2]};
    KEYS.forEach(function (n) {
      var k = KEYS_TABLE[n]; if (!k) return;
      var b = document.createElement('button'); b.type = 'button'; b.textContent = k[0]; b.setAttribute('aria-label', k[1]);
      var down = false, t1 = 0, t2 = 0;
      function stop() { if (!down) return; down = false; clearTimeout(t1); clearInterval(t2); b.classList.remove('on'); fire('keyup', k); }
      b.addEventListener('pointerdown', function (ev) { ev.preventDefault(); if (down) return; down = true; b.classList.add('on'); fire('keydown', k, false);
        t1 = setTimeout(function () { t2 = setInterval(function () { fire('keydown', k, true); }, 70); }, 260); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { b.addEventListener(t, stop); });
      b.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });
      if (DIR[n]) { var p = pos[n]; b.style.gridColumn = p[0]; b.style.gridRow = p[1]; d.appendChild(b); } else a.appendChild(b);
    });
    if (d.children.length) root.appendChild(d);
    if (a.children.length) root.appendChild(a);
    document.body.appendChild(root);
  }
  var KEYS_TABLE = __TABLE__;
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
"""


def build_js(keys):
    return JS_TEMPLATE.replace("__KEYS__", json.dumps(keys)).replace(
        "__TABLE__", json.dumps({k: list(v) for k, v in KEYS.items()}))  # \uXXXX: لا نعتمد على ترميز الخادم


def inject(site: Path, keys):
    """يكتب _touch_controls.js ويضيف وسمه إلى index.html. يرجع True عند النجاح."""
    idx = site / "index.html"
    if not idx.is_file():
        return False
    try:
        html = idx.read_text("utf-8", errors="ignore")
    except Exception:
        return False
    if "_touch_controls.js" in html:
        return True
    (site / "_touch_controls.js").write_text(build_js(keys), encoding="utf-8")
    tag = '<script src="_touch_controls.js"></script>'
    if re.search(r"</body>", html, re.I):
        html = re.sub(r"</body>", tag + "\n</body>", html, count=1, flags=re.I)
    else:
        html += "\n" + tag + "\n"
    idx.write_text(html, encoding="utf-8")
    return True
