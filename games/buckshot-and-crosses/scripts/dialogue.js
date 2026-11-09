/**
 * This file contains dealer dialogue lookup data and selection helpers.
 */

/** Selects a random dealer line from the requested dialogue group.
 * @param {string} key - Key in dealerDialogue.
 * @returns {string} The selected line.
 */
function chooseRandomDialogue(key) {
  const dialogueArray = dealerDialogue[key];

  const randomIndex = randint(0, dialogueArray.length - 1);
  return dialogueArray[randomIndex];
}

const dealerDialogue = {
  sign: ["Sign the waiver.", "On the dotted line.", "Pen to paper, please."],
  start: ["Good luck.", "Your mistake.", "Hope you read the fine print."],
  blank: ["Blank shell!", "No luck this time.", "Oops, nothing there."],
  live: [
    "Should've checked the chamber.",
    "I would've shot that one.",
    "Better luck next time.",
  ],
  eject: ["Wise choice.", "Good call.", "Lucky you."],
  mistake: [
    "Hmm, I thou-, never mind.",
    "Interesting...",
    "All part of my plan.",
  ],
  occupied: [
    "That one's taken!",
    "Someone beat you to it.",
    "No room at the inn.",
  ],
  skip: [
    "...kzzzt... can't... —th—... krrrzt...",
    "...is... ...ng ...n?...",
    "...",
    "...— — —...",
  ],
  playerTurn: ["Your move.", "Make your choice.", "Your turn.", "Time to act."],
  reset: [
    "Looks like a stalemate.",
    "Back to square one.",
    "It's not over yet.",
  ],
  dealerWin: [
    "Ooh! That must've hurt.",
    "Careful now...",
    "I think you need a new strategy.",
    "I thought you were better than that.",
  ],
  playerWin: [
    "I thought you had it in you.",
    "Not bad...",
    "It'll take more than that to beat me.",
    "You got lucky this time.",
  ],
  gameLose: [
    "No more chances for you.",
    "End of the road.",
    "Not good enough.",
  ],
  gameWin: [
    "I can't believe it!",
    "You did it!",
    "I underestimated you.",
    "I guess I was wrong.",
  ],
};
