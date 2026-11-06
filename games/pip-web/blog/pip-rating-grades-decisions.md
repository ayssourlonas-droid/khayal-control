# A poker rating that ignores whether you won the hand

5 November 2026

## The problem with counting wins

Poker results are mostly the cards. You can play a hand perfectly and lose it, and play it badly and win, and over an evening the cards can hide which of those you did. A rating built on who won would mostly be a rating of luck.

The Pip Rating ignores who won. It looks at each decision when you made it, with the cards you could see, and asks how much that decision gave away against the other choice. A right call that loses to a river card costs you nothing. A bad call that gets lucky still costs what it cost.

## What it grades

Two kinds of decision. Every call or fold you make facing a bet, priced in big blinds from your equity and the price you were offered. And your first move when it folds round to you before the flop, graded against the two charts the app already teaches: the shove chart when you have 15 big blinds or fewer, the opening chart from 25.

It does not grade bets and raises after the flop. What they are worth depends on how often the other player folds, and the only players we could measure that against are Pip’s own. A rating built on that would reward beating our AI, which is not the same thing as playing well. The hand review still grades those, with every card face up.

It counts Hold’em hands at the ladder, the Rail, the Daily, the freeroll and the Hold’em side tables. Not the other variants, not drills, and not rooms with friends, for now.

## The scale

Each decision has a stake (the pot plus the price) and a cost (what it gave up, at most 20 big blinds). Your rating comes from the share of the stake you gave away, over roughly your last 300 decisions, with recent ones counting more.

Give away 2.5% and you rate 1,000. Every time you halve that, you gain 350 points: 1.25% is 1,350, 0.625% is 1,700. Double it and you lose 350: 5% is 650.

Weighting by stake is what stops the obvious trick. Fold everything and you make hundreds of cheap, correct folds, but the few expensive ones you get wrong carry the weight.

The bands are Learning (under 800), Steady (800), Solid (1,200), Strong (1,600), Expert (2,000), Master (2,400).

## Where people land

We seated scripted players at real tables against each table’s own AI and rated their hands exactly as the app does, a few hundred rated decisions each, so each figure is give or take about 100. Calling every bet rated about 400. So did folding to every bet, and so did calling or folding on a coin flip. Paying everything and paying nothing land in the same place.

The best player we could script, which plays the shove chart exactly, rated 1,670 to 2,160. So 2,000 sits at about the edge of the best play Pip has, and most people will never see it. That is on purpose. Nobody reaches 2,000 in chess in a month either.

Those scripted players decide with the same equity estimate that grades them, so they agree with the grader more than a person would. Real players will sit lower than their script. We would guess a careful beginner starts somewhere around 600 to 900, and we will know more once enough people have played.

## New players

Everyone starts at 1,000. The rating is provisional until 50 rated decisions. After that the number is held under 1,600 until 300 decisions, under 2,000 until 1,000, and under 2,400 until 2,500. A good week is not a career. Your play still counts in full underneath, so the number catches up when a cap lifts, and the app tells you when one is holding you back.

## What the server can and cannot check

Hands against the AI are dealt and played on your device. The server never sees a hand, only the list of decisions and what each cost. Someone determined could send decisions that never happened, and no check can prove otherwise.

What it can do is make that slow and visible. It works the rating out again itself rather than trusting the number your device sends. It refuses decisions that cost more than they could, hands less than two seconds apart, hands it has already counted, and more than900 decisions an hour. Once you are rated, one batch of hands moves you at most 60 points. And a record of 2,600 or better after 200 decisions comes off the leaderboard until a person has looked at it.

Someone patient enough can still beat that. If it becomes a problem, the fix is to rate only hands our server deals, which is how rooms with friends already work.

## Who sees what

The number is free for everyone. Make an account and you are on the leaderboard, and you can take yourself off it at any time without your rating stopping. It is the one ranking on Pip anyone else can see. Your chips and your Roll title stay private.

Nothing you can buy raises it, because it measures decisions, and more tables or more chips do not make a call any better. What [members](https://playpip.io/membership?for=rating&from=blog&post=pip-rating-grades-decisions) get is the rating drawn day by day, and which kinds of decision are moving it. The number tells you where you are. The breakdown tells you which of your folds is doing it.

## How we counted

The arithmetic is one file, [`src/lib/rating/maths.ts`](https://github.com/playpip/pip-web/blob/main/src/lib/rating/maths.ts), and the server runs an exact copy of it. The opening and shove grades are [`src/lib/rating/preflop.ts`](https://github.com/playpip/pip-web/blob/main/src/lib/rating/preflop.ts). The scripted players are [`scripts/rating-calibrate.ts`](https://github.com/playpip/pip-web/blob/main/scripts/rating-calibrate.ts), run on 5 November 2026, and [`docs/rating.md`](https://github.com/playpip/pip-web/blob/main/docs/rating.md) has the full table and everything the server checks. Every figure on this page except the calibration comes from the code at build time, so if the scale changes, this page changes with it.
