# A poker night with friends, online, with nothing to settle up

19 October 2026

## Since this was written (corrected 2 November 2026)

Since 2 November a room opened with a free account has up to four seats and no camera or voice. A member’s room has up to eight, with camera and voice. Friends still join any room free.

## Since this was written (corrected 26 October 2026)

Below, this post says hosting needs the membership. Since 25 October anyone with a free Pip account can open one room a day, play one quick match a day and host one slow game at a time. The membership opens as many as you like.

## The short version

One person opens a private room on Pip and sends the others a link. Up to eight of you sit at one Texas Hold’em table, with your cameras and mics on if you want them. The host needs the membership. Everybody else needs a free account and the link.

The chips are play chips. Nobody owes anybody anything at the end, which used to be the hardest part of the evening.

## Who deals

Our server does. It shuffles, deals, and sends each player their own two cards and nobody else’s, until a showdown turns them over. Nobody has to hold a deck up to a webcam and read out the flop. How that works, and the test that checks it, is in [Your cards stay on the server](https://playpip.io/blog/your-cards-stay-on-the-server).

## What the host sets

Before the first hand, the host picks:

-   the seats, from two to eight;
-   the stake, one of the ladder’s, which sets the chips and the blinds;
-   starting chips: standard, deep or very deep;
-   blinds: slow, normal, turbo, or fixed so they never rise;
-   time to act: 15, 30 or 60 seconds;
-   what happens when somebody leaves;
-   whose chips: from the Roll, or just for fun.

Everybody at the table can read the rules. Only the host can change them, and only before the deal. The game is a sit-and-go: the same stack each, the blinds climb unless you fixed them, and the last player with chips wins. The rules live in [`src/lib/multiplayer/room.ts`](https://github.com/playpip/pip-web/blob/main/src/lib/multiplayer/room.ts).

## Whose chips

The Roll is the bankroll you carry up Pip’s ladder. _From the Roll_ takes the buy-in from each player’s Roll and pays the winner the buy-in times the seats. _Just for fun_ takes nothing and pays nothing.

Either way the chips are never for sale, and nobody at the table sees anybody else’s Roll or rank. The membership changes nothing once the cards are dealt. A host who pays plays the same cards as a friend who didn’t.

## Faces and voices

Both are off until you tap them. Turn the camera on and your face takes your seat where the avatar was. Turn the mic on and the room hears you. The picture is 320 by 240 at 15 frames a second, which is enough to see somebody trying not to smile.

Video and voice go between players’ browsers; the room server passes on the messages that connect them. Tap anybody’s seat to mute them or hide their camera, for you only. Report and block are on the same sheet. A blocked player’s camera and voice stop reaching you, and they are not told.

## When somebody gets up

Stand up mid-game and the host’s rule decides. With _Keep their seat_, your chips stay and your hands fold until you sit back down. With _They’re out_, you are out after the hand in progress, which is how some poker nights have always ended.

Short of people? Before the deal the host can fill empty chairs with Pip’s regulars, the same characters you meet on the ladder.

## What it doesn’t do

It is Hold’em only. There is no real money and no way to add any. A room is cleared half an hour after its game ends, so there is no record of who won last week. You will have to remember that yourselves, and you will.

## Where it is

Opening a room is part of the [membership](https://playpip.io/membership?for=multiplayer&from=blog&post=poker-night-with-friends-online), and that page says what else is in it. Joining a friend’s room is free, and so are the ladder, the Rail, the Daily and the freeroll.
