# Calling a river bet: when the answer depends on who is betting

29 October 2026

## The short version

They bet the river. You have a pair. Calling costs a share of the pot you would win, and your hand has to win at least that often to be worth it. A bet of half the pot needs 25%. A bet of the pot needs 33.3%.

That half is arithmetic. The other half is how often your pair wins against the hands that bet like this, and that depends on how many of those bets are bluffs. We dealt 40,000 hands through Pip’s river drill to see how often that changes the answer. In 39,746 of 157,878 river decisions, it did.

## The price

A call wins the pot plus their bet, and it costs your bet. So the share you pay is the bet over the pot plus both bets. The bigger the bet, the more often you need to win:

-   A bet of a fifth of the pot: you need to win 14.3%
-   A bet of a third of the pot: you need to win 20%
-   A bet of half the pot: you need to win 25%
-   A bet of three-quarters of the pot: you need to win 30%
-   A bet of the pot: you need to win 33.3%
-   A bet of twice the pot: you need to win 40%

None of this depends on who is betting. Everything after it does.

## Who is betting

Pip’s river drill reads a bet as two kinds of hand. Value: the stronger half of the made hands they could have, or the strongest third when the bet is more than two-thirds of the pot. And bluffs: hands that missed, counted at a weight, because they bet some of those and not all of them.

The weight is the one number nobody can know about a stranger. So the drill prices every spot twice, once at the rate Pip’s AI players at Friends’ Garage bluff, the bottom of the ladder, and once at The Main Event’s, the top, where they bluff a good deal more. Those rates were measured from the AI players’ own river bets, not chosen.

## What we found

Of 40,000 shuffles, 13,294 left you with a hand you would have played and a pair or better of your own on the river. Each was priced at twelve bet sizes, from a fifth of the pot to twice it: 157,878 different decisions. In 39,746 of them the call was right against one of those two players and wrong against the other.

That share hardly moves with the size of the bet. Out of 13,294 hands, it is between 2,830 and 4,053 at every size. What moves is the rest. Facing a fifth of the pot, the call was right against both players 6,530 times and wrong against both 3,139 times. Facing twice the pot, it was right against both 3,041 times and wrong against both 7,241.

Some of that is the price, and some is that the drill assumes a big bet is a stronger hand. Either way the lesson is a dull one. Against a small bet a pair is right to call about twice as often as it is right to fold, against a big one the other way round, and about one time in four the hand in front of you is not what decides it. The player is.

## What the drill does about it

It leaves those out. A spot is only asked when the answer is the same against both players, and clear of the line by four points at each end. 1,033 of the 40,000 shuffles became a question. So the drill never marks you wrong for a call that was right against the other player.

A real table does not leave them out. There, knowing who bluffs is your job, and the price is the only part anybody can work out for you.

## How we counted

[`src/lib/drills/riverBluffCount.ts`](https://github.com/playpip/pip-web/blob/main/src/lib/drills/riverBluffCount.ts) deals the drill’s own spots, the same deal and prices the drill grades, and sorts each bet into right to call, right to fold, or depends. The model of what bets is [`src/lib/drills/riverRange.ts`](https://github.com/playpip/pip-web/blob/main/src/lib/drills/riverRange.ts), where the measured bluffing rates are written down. The counts on this page are in [`src/config/riverBluffs.ts`](https://github.com/playpip/pip-web/blob/main/src/config/riverBluffs.ts), and [`tests/riverBluffCount.test.ts`](https://github.com/playpip/pip-web/blob/main/tests/riverBluffCount.test.ts) counts them again on every build.

Every win share is exact against the model: each hand they could hold is compared with yours once. They are counts over a model of what bets, not over hands people played. Boards that make two pair on their own are left out, as the drill leaves them out.

## Where it is

Calling the river is a drill in the [membership](https://playpip.io/membership?for=river&from=blog&post=calling-a-river-bet). The page that link opens deals one spot from it. _What have you got?_ and _Which hand wins?_ stay free, with the ladder, the Rail, the Daily and the freeroll.
