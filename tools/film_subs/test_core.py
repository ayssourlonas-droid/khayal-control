import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from subs_core import *

raw = """1
00:00:01,000 --> 00:00:02,500
Hello, my name is

2
00:00:02,600 --> 00:00:04,000
<i>Bunny</i> and I like carrots.

3
00:00:09,000 --> 00:00:10,000
Run!
"""
cues = parse_srt(raw)
assert len(cues) == 3 and cues[1].text == "Bunny and I like carrots.", cues
g = group_cues(cues)
assert [len(x) for x in g] == [2, 1], g
out = translate_cues(cues, lambda ts: [t.upper() + " تمت" for t in ts])
assert len(out) == 3 and out[0].start == 1.0 and out[2].text.startswith("RUN"), out
s = compose_srt(out)
assert "00:00:01,000 --> 00:00:02,500" in s and parse_srt(s)[0].start == 1.0
assert wrap_lines("a " * 60).count("\n") == 1
assert len(split_long_cue(Cue(0, 10, "word " * 40 + ". " + "x " * 30))) >= 2
print("OK", len(out))
