# Five-Card Draw: what the number of cards gives away

14 October 2026

## The only tell

In Five-Card Draw nobody shows a card until the end. There is no board. The one thing you learn about anybody’s hand is how many cards they asked for.

At Pip’s Draw tables, The Parlour, the regulars all decide what to throw by the same short rule, [`src/lib/poker/ai/draw.ts`](https://github.com/playpip/pip-web/blob/main/src/lib/poker/ai/draw.ts). A fixed rule turns that number into a read. So we dealt every one of the 2,598,960 five-card hands through it and counted what each number means.

## None: they have it

A regular stands pat on a straight or better and on nothing else. That is 19,716 deals, about one in 132. No regular stands pat on a bluff, so when one does, believe it.

## One: two pair, or a draw

One card covers three different hands. Two pair throws its odd card: 123,552 deals. Four to a flush throws the fifth: 110,940, and 34,320 of those broke up a pair to do it. Four in a row throws the fifth too: 60,480.

So we dealt the card too: every one of the 47 left, for each of those deals. A little over one in seven ends with a straight or better, the full houses included. About one in three ends with nothing at all, not even a pair. Two pair is still the likeliest thing to come over at the end. One card deserves some respect. Not a lot.

## Two: three of a kind, every time

Only trips draw two. 54,912 deals, and nothing else in the rule asks for two. Of all the numbers it is the one that tells you exactly what you are up against.

## Three: a pair

The common one, 1,057,224 deals, about four in ten. The rule keeps any pair, deuces included, and throws the rest. Even a pair of twos beats drawing four to an ace, which is what the next number is.

## Four and five: nothing

Four cards means an ace and nothing to go with it: 466,560 deals. Five means not even that: 698,880, more than one deal in four. A regular holding K-Q-8-6-3 throws the lot.

## The one coin flip

A pair at the end of four in a row, say 5-6-7-8-8, could go either way. The rule keeps the run and draws one 35 times in 100, and keeps the pair and draws three otherwise. It comes up in 6,696 deals, and it is the only spot where the number can mislead you.

## What it does not chase

An ace closes a straight at one end. J-Q-K-A fills only with a ten and A-2-3-4 only with a five, four cards rather than the eight that fill 8-9-T-J. The rule chases neither. It keeps the ace and asks for four.

It also misses a pair in the middle of the run. Holding 5-6-6-7-8, it does not see the four in a row, keeps the sixes and draws three.

[`tests/draw.test.ts`](https://github.com/playpip/pip-web/blob/main/tests/draw.test.ts) holds the rule itself, a hand for each number from standing pat to throwing all five. The counts come from one run over every deal, which takes too long for the test suite, so they are not pinned the way the rule is.

## Where it is

The Parlour is one of the side tables in the [membership](https://playpip.io/membership?for=draw&from=blog&post=five-card-draw-what-a-draw-gives-away), at two stakes. The page that link opens deals one hand through the draw first, each side throwing by the same rule. The ladder, the Rail, the Daily and the freeroll stay free.
