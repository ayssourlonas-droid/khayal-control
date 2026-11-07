# Turn-based poker with friends who are never free at once

22 October 2026

## Since this was written (corrected 2 November 2026)

Since 2 November a room opened with a free account has up to four seats and no camera or voice. A member’s room has up to eight, with camera and voice. Friends still join any room free.

## Since this was written (corrected 26 October 2026)

Two things below stopped being true within three days. Since 25 October anyone with a free Pip account can host one slow game at a time, and open one live room a day; the membership hosts as many as you like. And since 24 October a slow table has camera and voice, the same as a live room, for when you both happen to be there.

## The short version

A slow game is a private Texas Hold’em table where each move gets hours, not seconds. You check on the bus, your friend calls after lunch, the river comes the next morning. Nobody has to be free at the same time, which for most groups of friends is the whole problem.

The host needs the membership. Everybody else needs a free account and the invite. The chips are play chips.

## What the host picks

-   2, 3 or 4 seats, heads-up unless you change it, and no AI players in the empty ones;
-   time for each move: 1, 4, 12 or 24 hours;
-   how it ends: last player standing, after 20, 50 or 100 hands, or on a date, when the hand in play finishes and the biggest stack wins;
-   the stake, starting chips, how fast the blinds climb, and whether the chips come from the Roll or it is just for fun, the same as [a live room](https://playpip.io/blog/poker-night-with-friends-online).

The blinds climb by hands played, not by the hour, so a game that takes a fortnight is not all blinds by the end of it. You can be in 10 slow games at once, which is more than most people have friends who answer.

## The clock stops while you sleep

Each player sets their own quiet hours, 23:00 to 08:00 unless they change them, in their own timezone. Your move clock does not run during yours. A one-hour clock that starts at 22:30 has half an hour that night and half an hour after eight the next morning, and the clocks going back in October is handled too. The arithmetic is in [`src/lib/multiplayer/slow.ts`](https://github.com/playpip/pip-web/blob/main/src/lib/multiplayer/slow.ts).

Run out of time and Pip checks for you if it can and folds if it can’t. Do that twice in a row and you are sat out, moved for straight away, until you next open the game.

## Moves set in advance

While somebody else is thinking, you can set check/fold, check, or call. When the turn reaches you, it is made for you if it still makes sense. A call lapses if the bet changes, and everything lapses when the street ends. Nobody else at the table is told what you set. Live rooms have these now too.

## What you missed

Open a game after a day away and the hands you missed play out on the felt, move by move, before you get the table back. There is a Skip. A slow game keeps its last ten hands for this. Each one is dealt again from the moves that were made, and if the replay does not end where the real hand did, it isn’t shown. A wrong replay is worse than none. The rebuild is [`src/lib/multiplayer/catchUp.ts`](https://github.com/playpip/pip-web/blob/main/src/lib/multiplayer/catchUp.ts).

## Being told it is your move

Pip asks once, at your first slow game’s table, whether it may send notifications. Say yes and you get one when it is your move. On an iPhone, a browser can only do that once Pip is on your Home Screen.

Email is on unless you turn it off. It comes only if a move has waited a quarter of its clock, or five minutes when there is no device to notify. One email lists every game waiting on you, at most one every twelve hours, and each has a link that turns them off in one tap. Nothing arrives during your quiet hours, or while you have the table open. The rules are [`src/lib/multiplayer/notices.ts`](https://github.com/playpip/pip-web/blob/main/src/lib/multiplayer/notices.ts), and the switches are under Settings, Slow games.

## What it doesn’t do

It is Hold’em only, there are no cameras at a slow table, and there is no real money and no way to add any. A game nobody starts is cleared after three days, and a finished one stays on Pip’s Home for a week, long enough to mention it to the loser.

## Where it is

Opening a slow game is part of the [membership](https://playpip.io/membership?for=multiplayer&from=blog&post=turn-based-poker-with-friends), as is opening a live room. Joining a friend’s game is free, and so are the ladder, the Rail, the Daily and the freeroll.
