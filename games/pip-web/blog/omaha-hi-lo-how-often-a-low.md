# How often is there a low in Omaha Hi-Lo?

20 October 2026

## Half the pot, if there is a half

In Omaha Hi-Lo every pot is cut in two. The best hand takes one half. The best low takes the other: five cards of different ranks, all eight or lower, the ace counting as one, and still exactly two from your hand with three from the board. If nobody makes a low, the high hand takes the lot.

The description of The Split, Pip’s Hi-Lo table, says nobody makes one about half the time. That is the kind of sentence that gets written once and never checked, so we checked it.

## The board decides first

You have to use three board cards for a low, and they have to be three different ranks from ace to eight. A board without them has no low on it for anybody, whatever they hold.

Of the 2,598,960 possible boards, 1,561,728 have three. That is six boards in ten. On the other four, the low half of the game does not happen.

## One hand

Then you need two cards of your own, eight or lower, that are not the same ranks as the three you use from the board. Deal one four-card hand and a board every way it can be dealt, 463,563,500,400 ways, and the hand makes a low in 161,374,983,168 of them. A little over one in three.

Even on a board that allows a low, one hand gets there in 161,374,983,168 of 278,557,614,720. Not quite six in ten.

## Ace-deuce, and the deuce on the board

Ace-deuce is the low every Hi-Lo player wants to be dealt. Hands holding an ace and a deuce make a low in 13,947,611,904 of 29,650,256,064 deals. A little under half.

The board does most of that. It still needs three different low cards, and they have to be ranks you are not already using. You hold A♠ 2♠ K♦ K♣ and the board comes 2♥ 5♦ 7♣ J♥ Q♠. Three low ranks, so a low is possible. Not for you: your low cards are an ace and a deuce, the board’s are a deuce, a five and a seven, and five different ranks cannot be made from those. Players call that being counterfeited.

Make the 2♥ a 3♥ and the same four cards make 7-5-3-2-A.

## More hands, more lows

The question the table cares about is whether _anybody_ makes one, and that depends on how many hands get to the end. We dealt 1,000,000 deals of six hands and a board, everybody staying to the river, and counted the deals where at least one of the first one, two, three hands and so on had a low:

-   One hand: 348,021
-   Two: 495,914
-   Three: 559,220
-   Four: 585,243
-   Five: 595,470
-   Six: 599,126

The first row is a sample of the exact one-in-three above, and lands close to it. Two hands make a low half the time, so “about half” is right heads-up. With six, somebody has one in six deals of ten, and the number cannot climb much further: it is already pressed against the boards that allow one at all. A real table sits somewhere in between, because people fold.

## How we counted

A low only cares about which ranks from ace to eight are where, so the exact counts are worked out by rank rather than card by card, which takes under a second. [`tests/hiLoCounts.test.ts`](https://github.com/playpip/pip-web/blob/main/tests/hiLoCounts.test.ts) does it on every run and checks that shortcut against [`src/lib/poker/hiLo.ts`](https://github.com/playpip/pip-web/blob/main/src/lib/poker/hiLo.ts), the evaluator that settles the low half at The Split, on twenty thousand dealt hands.

The six-hand rows are a sample, run through that same evaluator with seed 20261020. A million deals take two minutes, too long for the test suite, so they are typed into [`src/config/hiLoCounts.ts`](https://github.com/playpip/pip-web/blob/main/src/config/hiLoCounts.ts) and not re-run.

## Where it is

The Split is one of the side tables in the [membership](https://playpip.io/membership?for=hilo&from=blog&post=omaha-hi-lo-how-often-a-low), at two stakes. A tap on it there deals a showdown where three kings take the high half, an ace and a three take the low, and a pair of queens wins nothing. The ladder, the Rail, the Daily and the freeroll stay free. So did the counting.
