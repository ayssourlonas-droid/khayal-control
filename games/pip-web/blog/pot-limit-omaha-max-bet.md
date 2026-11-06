# The most you can bet in Pot-Limit Omaha

27 October 2026

## Raise the pot, after you call

In Pot-Limit Omaha the most you can bet is the pot. That part is easy. The part people stop and count on their fingers is raising: you may raise by the size of the pot _after_ you have called. Put the call in, look at the pot, and raise by that much.

Every number below is from The Big Pot, Pip’s Omaha table: 6 seats, 10,000 chips each, blinds of 25 and 50 to start. None of them were worked out by hand. They are what the table itself lets you put in.

## The first raise

Before the flop the pot is the two blinds, 75. The first player to act calls 50, which makes it 125, and raises by that: 175 in all. Three and a half big blinds, which is the number to remember.

## Everybody re-raises

Now let every player in turn raise as much as they are allowed.

-   Under the gun: to 175, the first raise
-   Hijack: to 600
-   Cutoff: to 2,050
-   Button: to 7,000
-   Small blind: all-in for 10,000

The fifth raise is the whole stack. The pot would allow more, and there is no more. 200 big blinds sounds deep until four people have raised the pot.

## The shortcut, and the blind it misses

The sum players do in their heads is three times the bet you face, plus whatever was in before it. The hijack faces 175 with 75 of blinds behind it: three times 175 is 525, plus 75, is 600. Right.

For a blind it is out by the blind. Fold round to the big blind instead and it faces the same 175, but 50 of the pot is already its own, and the call is only 125. The most it may make it is 550, not 600. So: three times the bet, plus what was in before it, less what you already put in on this street.

## After the flop

Say the first raise is called by the big blind and everyone else folds. The flop pot is 375, and the big blind, first to act, may bet 375: the pot, since there is nothing to call. Raising that is the shortcut again with nothing of yours in yet, three bets and the pot, which is 1,500.

A pot that starts at 375 can be 2,250 before anyone has called anything on the flop. Pot limit is a limit. It does not feel like one for long.

## How we counted

The rule lives in one function in [`src/lib/poker/engine.ts`](https://github.com/playpip/pip-web/blob/main/src/lib/poker/engine.ts), the engine that deals every hand at The Big Pot and at The Split, Pip’s Omaha Hi-Lo table, which is pot-limit too. [`src/config/potLimit.ts`](https://github.com/playpip/pip-web/blob/main/src/config/potLimit.ts) plays the hands above through that engine and prints what it allows, and [`tests/potLimit.test.ts`](https://github.com/playpip/pip-web/blob/main/tests/potLimit.test.ts) checks the shortcut against every one of them. So this page cannot print a number the table would refuse, and the shortcut cannot drift from the table without the build failing.

You do not have to do the sum at the table. The Max button on the bet slider is the pot limit, or your stack if that is smaller.

## Where it is

The Big Pot and The Split are side tables in the [membership](https://playpip.io/membership?for=omaha&from=blog&post=pot-limit-omaha-max-bet). The ladder, the Rail, the Daily and the freeroll stay free, and so does the arithmetic.
