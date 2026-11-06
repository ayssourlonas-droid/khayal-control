# Set mining needs a deep stack. How long each table gives you one

30 October 2026

## The call

Set mining is calling a raise with a small pair for one reason: to flop three of a kind. If the flop misses, you fold. If it hits, you hope somebody has a hand they like.

The flop brings your third card 2,304 times in 19,600 ([how often you flop a set](https://playpip.io/learn/how-often-do-you-flop-a-set) has the full count). The other 17,296 times it does not. That is 7.5 misses for every hit, and every miss costs the call.

## What the hit has to win

Say the raise is to 3 big blinds. Each miss costs 3, so to break even each hit has to win back 7.5 of those, about 23 big blinds, on top of the 3 it cost. Call it 26 big blinds in front of you.

The raiser needs them too. You can only win what they have, so the number that counts is the smaller of the two stacks.

And 26 is the floor. It assumes every set wins and every raiser pays you all of it. Sets lose, and people fold. The real number is higher, but nobody can tell you by how much without knowing who you are playing.

## How long a table keeps 26 big blinds

In a tournament the blinds go up, so the same stack is worth fewer big blinds every level. Here is how many hands each of Pip’s tables deals before the stack you sat down with is under 26 big blinds, with the ladder table and Deep Stack at the same buy-in side by side.

-   750 chips: The Pool Hall starts you at 75 big blinds and keeps 26 for 20 hands. Deep Stack starts you at 225 and keeps it for 72.
-   2,000 chips: The Card Room starts you at 67 big blinds and keeps 26 for 18 hands. Deep Stack starts you at 200 and keeps it for 60.
-   5,000 chips: Downtown Casino starts you at 100 big blinds and keeps 26 for 18 hands. Deep Stack starts you at 300 and keeps it for 84.
-   15,000 chips: The Riverboat starts you at 100 big blinds and keeps 26 for 18 hands. Deep Stack starts you at 300 and keeps it for 84.
-   40,000 chips: The Penthouse starts you at 100 big blinds and keeps 26 for 18 hands. Deep Stack starts you at 300 and keeps it for 84.

The ladder gives you 18 to 20 hands of set mining. Deep Stack gives you 60 to 84, more than three times as many at every price. With three times the chips and the same opening blinds, the blinds have to climb three times as high before the stack runs short, and Deep Stack’s levels last twelve hands at every price.

## What this does not count

It counts the stack you sat down with. Win a pot and you are deeper than this, lose one and you are shorter, and the raiser’s stack moves the same way. Nor does anyone at the table promise to raise to 3 big blinds. Treat the numbers as a clock, not a forecast: they say when the blinds alone stop the call paying, and nothing about your cards.

## How we counted

[`src/config/setMining.ts`](https://github.com/playpip/pip-web/blob/main/src/config/setMining.ts) takes the flop count from the same file the set guide prints it from, and walks each table’s blinds hand by hand through [`src/config/blinds.ts`](https://github.com/playpip/pip-web/blob/main/src/config/blinds.ts), which is what the tables post their blinds with. [`tests/setMining.test.ts`](https://github.com/playpip/pip-web/blob/main/tests/setMining.test.ts) deals every flop again to recount the 2,304, and checks every figure on this page. Change a table’s blinds and this page changes with it, or the build fails.

## Where it is

Deep Stack is a side table in the [membership](https://playpip.io/membership?for=rooms&from=blog&post=deep-stack-set-mining), at five prices from 750 to 40,000. The ladder stays free, and so does folding your sevens.
