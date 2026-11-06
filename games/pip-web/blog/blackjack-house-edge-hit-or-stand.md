# The house edge in Blackjack when you can only hit or stand

26 October 2026

## The numbers on the cards

Pip’s Blackjack has two buttons, hit and stand. There is no doubling, no splitting and no surrender. Each of the three tables states its house edge on the card before you sit down, because a number you have to work out for yourself is a number somebody hoped you would not.

So we played 40 million hands at each table, through the same code that deals them in the app, and counted what the house kept.

-   Friendly (single deck, 3:2 on a natural, dealer stands on soft 17): the card said 2%, the hands said 1.99%.
-   Standard (six decks, 3:2 on a natural, dealer stands on soft 17): the card said 2.4%, the hands said 2.34%.
-   Brutal (eight decks, 6:5 on a natural, dealer hits soft 17): the card said 4.1%, the hands said 3.94%.

Friendly was right. The other two were wrong, both by saying the house took more than it does, which is the less embarrassing way to be wrong. It is still wrong on the one screen whose whole point is the number, so the cards now say 2.3% and 3.9%.

## What the rules are worth

Friendly and Standard differ only in the shoe: one deck against six. That alone is worth 0.35 points to you. Part of it is naturals: they come a little more often from one deck, and a natural is the only hand that pays more than evens.

Brutal changes three things at once. Eight decks, the dealer hits a soft seventeen, and a natural pays six for five instead of three for two. Together they cost 1.60 points more than Standard. Most of that is the six for five: a natural comes about once in twenty-one hands, and it now pays three tenths of a bet less each time.

Every table here takes more than a casino table with the same shoe and payouts, because doubling and splitting are gone, and both were yours to use. We took them out to keep the game to one decision. The edge on the card is what that decision costs.

## How to play it

With only hit and stand, the best play fits in a paragraph. Take a card on 11 or less. Stand on 17 or more. On 12, stand against a dealer 4, 5 or 6 and hit against anything else. On 13 to 16, stand against 2 to 6 and hit against 7 or higher. With an ace counted as eleven, hit 17 or less, hit 18 against a 9, a ten or an ace, and stand on 19 or more.

If you know the usual chart, two things change. A hard 9, 10 or 11 you would double you now just hit, a soft 18 you would double against a 3 to 6 you stand on, and a pair is only its total. A pair of eights is a hard 16, and you hit it against a ten, grimly.

That is the whole strategy the 40 million hands were played with. Play any other way and the house takes more than the card says.

## How we counted

[`scripts/blackjack-edge.ts`](https://github.com/playpip/pip-web/blob/main/scripts/blackjack-edge.ts) deals hands through Pip’s Blackjack engine, reshuffles where the app reshuffles, plays each one by the strategy above, and reports the share of each stake the house kept. It ran two separate seeds of 20 million hands a table. Each figure carries a standard error of about 0.016 points, so the first decimal is solid and the second is close.

The strategy was worked out exactly for a shoe with no bottom, where every card is as likely as it was at the start. Over that endless shoe the same strategy loses 2.4% at Standard’s rules and 4.0% at Brutal’s. A real shoe does slightly better for you than an endless one, which is why every dealt figure sits below these.

The count takes three minutes and is not re-run by the test suite. [`tests/blackjackEdge.test.ts`](https://github.com/playpip/pip-web/blob/main/tests/blackjackEdge.test.ts) holds the part it can: each card states the edge its table played at, to one decimal, read from [`src/lib/blackjack/rules.ts`](https://github.com/playpip/pip-web/blob/main/src/lib/blackjack/rules.ts).

## Where it is

Blackjack is in the [membership](https://playpip.io/membership?for=blackjack&from=blog&post=blackjack-house-edge-hit-or-stand), with the Friendly, Standard and Brutal tables and their edges on show before you pick one. The chips are play money and are never for sale. It is not poker, and it does not pretend to be.
