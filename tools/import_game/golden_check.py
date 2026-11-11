"""مجموعة اختبار ثابتة لأدوات الاستيراد: أمثلة صغيرة حكمها معروف سلفاً. شغّلها بعد أي تعديل على browser_check/touch_controls:
    python tools/import_game/golden_check.py
تطبع PASS/FAIL لكل مثال وتخرج بالرمز 1 عند أي فشل. (لا تغني عن تجربة مستودعات حقيقية.)"""
import http.server
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from browser_check import browser_test  # noqa: E402
import touch_controls  # noqa: E402

FIXTURES = {
    'not_game_animation': "<!doctype html><meta charset=utf-8><canvas id=c width=300 height=300></canvas>\n<script>var g=c.getContext('2d'),y=0;setInterval(function(){y=(y+3)%300;g.fillStyle='rgba(0,0,0,.1)';g.fillRect(0,0,300,300);g.fillStyle='#0f0';g.fillText('7',50,y)},40)</script>\n",
    'keyboard_only': "<!doctype html><meta charset=utf-8><canvas id=c width=300 height=300></canvas>\n<script>var x=5;window.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')x--;if(e.key==='ArrowRight')x++});\nsetInterval(function(){var g=c.getContext('2d');g.clearRect(0,0,300,300);g.fillStyle='#0f0';g.fillRect(x*10,50,20,20)},40)</script>\n",
    'touch_game': "<!doctype html><meta charset=utf-8><canvas id=c width=300 height=300></canvas>\n<script>var x=5;c.addEventListener('touchstart',function(){x++});c.addEventListener('click',function(){x++});\nsetInterval(function(){var g=c.getContext('2d');g.clearRect(0,0,300,300);g.fillStyle='#0f0';g.fillRect(x*10,50,20,20)},40)</script>\n",
    'mouse_game': '<!doctype html><meta charset=utf-8><canvas id=c width=300 height=300 onmousedown="x++"></canvas>\n<script>var x=5;setInterval(function(){var g=c.getContext(\'2d\');g.clearRect(0,0,300,300);g.fillStyle=\'#0f0\';g.fillRect(x*10,50,20,20)},40)</script>\n',
    'button_app': "<!doctype html><meta charset=utf-8><button id=b>Play</button><div id=o></div>\n<script>document.getElementById('b').onclick=function(){o.textContent=Date.now()}</script>\n",
}

# اسم المثال: (input_events فارغة؟ , keyboard_only؟)
EXPECT = {
    "not_game_animation": {"no_input": True, "keyboard_only": False},
    "keyboard_only": {"no_input": False, "keyboard_only": True},
    "touch_game": {"no_input": False, "keyboard_only": False},
    "mouse_game": {"no_input": False, "keyboard_only": False},
    "button_app": {"no_input": False, "keyboard_only": False},
}


def main():
    bad = 0
    with tempfile.TemporaryDirectory() as td:
        for name, exp in EXPECT.items():
            site = Path(td) / ("site_" + name)
            site.mkdir()
            (site / "index.html").write_text(FIXTURES[name], encoding="utf-8")
            work = Path(td) / name
            work.mkdir()
            r = browser_test(site, work, work / "s.png", explore=False)
            no_input = r["input_events"] == [] and not r["interactive_els"]
            ok = r["ran"] and no_input == exp["no_input"] and bool(r["keyboard_only"]) == exp["keyboard_only"]
            print(("PASS" if ok else "FAIL"), name, "events=", r["input_events"], "els=", r["interactive_els"], "kbd_only=", r["keyboard_only"])
            bad += 0 if ok else 1
    # طبقة اللمس: تُكشف مفاتيح الأسهم وتُضاف دون كسر الصفحة
    with tempfile.TemporaryDirectory() as td:
        site = Path(td) / "k"
        site.mkdir()
        (site / "index.html").write_text(FIXTURES["keyboard_only"], encoding="utf-8")
        kd = touch_controls.detect_keys(site)
        ok = kd["keys"][:4] == ["left", "up", "right", "down"] and touch_controls.inject(site, kd["keys"])
        print(("PASS" if ok else "FAIL"), "touch_layer keys=", kd["keys"])
        bad += 0 if ok else 1
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
