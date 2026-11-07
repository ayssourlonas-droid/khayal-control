# How often both your cards play in Hold’em

15 October 2026

## The count

In Hold’em you hold two cards, the board shows five, and your hand is the best five of the seven. Nobody makes you say which five. So we counted how often your own two make it in.

Every way to deal two hole cards and a five-card board from one deck is 2,809,475,760 deals. For each one we took the best hand you can make and asked which of your cards it needs:

-   Both of them: 1,324,680,512.
-   One of them, either will do or only one helps: 1,347,370,964.
-   Neither, because the board alone is as good: 137,424,284.

So both your cards play in a little under half of all deals, and one card does the work slightly more often than two. In about one deal in twenty, your cards play no part at all.

These are deals to the river with nobody folding. Real hands fold, and the ones that get to a showdown are not a random sample. It is a count of what the cards can do, not of what players do with them.

## When the board plays

You 8♥ 2♣ · Board 9♠ 10♥ J♦ Q♣ K♠

You have a straight. So does everybody else still in the hand. Your eight makes a straight too, just a worse one, so it sits out. When the board is your best hand, every other player has at least the board as well, and the most you can win is a share.

You 3♣ 3♦ · Board A♠ A♥ K♦ K♣ Q♠

A pocket pair that does nothing. Aces and kings on the board, the queen as the kicker, and your threes are the third pair, which a hand of five has no room for. [Three pair](https://playpip.io/learn/three-pair-in-texas-holdem) has a page of its own.

## When one card does it

You A♥ 7♣ · Board K♥ 9♥ 5♥ 2♥ J♠

Four hearts on the board and the ace of hearts in your hand: an ace-high flush. The seven of clubs does not come into it. Swap it for any card but a heart and the hand is the same.

You 6♠ 7♠ · Board 8♠ 9♦ 10♣ K♥ 2♦

Here it takes both. Eight, nine and ten on the board, the six and seven in your hand, and neither card makes the straight without the other.

## More than one right answer

You K♥ 9♦ · Board 9♠ 10♥ J♦ Q♣ 3♠

The king makes a nine-to-king straight, and there are two nines to start it with, yours and the board’s. Both fives are the same hand. Neither is more right than the other.

Seven cards can be cut down to five in twenty-one ways, and usually one way is best. Of the 133,784,560 possible sets of seven, 3,079,988 have two or more that tie, about one in 43. Most of them, 2,386,100, are straights with a pair inside them like this one. Another 617,760 are three pair where the third pair is also the best kicker, so either card of it will do. The last 76,128 are full houses and fours of a kind with a spare card to choose between.

## How we counted

A short program dealt all 133,784,560 sets of seven and split each one every way it can be split into two hole cards and a board, which takes about a minute. It ranks hands with an evaluator of its own, written for speed, so it is not the code that settles Pip’s pots. Two checks tie it to that code. Its count of each hand type over seven cards matches the standard table exactly. And 400,000 random deals through Pip’s evaluator came out at 19,568 board, 191,959 one card and 188,473 both, against 19,566, 191,832 and 188,602 expected from the full count.

The full count is too slow for the test suite and is not pinned by it. [`tests/whichFivePlay.test.ts`](https://github.com/playpip/pip-web/blob/main/tests/whichFivePlay.test.ts) holds the rest: the three rows add up to every deal, and each hand in this post plays the cards it says it does, by Pip’s evaluator.

## Where it is

_Which five play?_ is a drill: seven cards, tap the five that count. It is graded by ranking all twenty-one fives, so when two tie, either one is right. It is in the [membership](https://playpip.io/membership?for=drills&drill=which-five-play&from=blog&post=how-often-both-your-cards-play). _What have you got?_, which asks you to name the hand rather than point at it, stays free for everyone, as does _Which hand wins?_
