/**
 * This file contains the core gameplay logic for the application.
 * It handles turn flow and win resolution.
 */

/** Resolves after the requested number of milliseconds.
 * @param {number} duration - Delay in milliseconds.
 * @returns {Promise<void>}
 */
function delay(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

/** Queues a grid-cell update so it cannot overlap another game action.
 * @param {HTMLElement} cell - Grid cell selected by the player or dealer.
 * @returns {Promise<*>} Result of the queued cell update.
 */
function updateCell(cell) {
  return queueAction(() => performUpdateCell(cell));
}

/** Finds a cell's zero-based position among its grid siblings.
 * @param {HTMLElement} cell - Grid cell to locate.
 * @returns {number} Cell index.
 */
function getCellIndex(cell) {
  return Array.from(cell.parentNode.children).indexOf(cell);
}

/** Records a shot and renders its shell mark in the selected cell.
 * @param {HTMLElement} cell - Cell receiving the mark.
 * @param {number} index - Cell index in grid state.
 */
function applyShotToCell(cell, index) {
  previousShot = { cell, index };
  grid[index] = shells[0];
  renderCellMark(cell, shells[0]);
  resetShotgun();
}

/** Resolves a dealer round win, including health loss or player game over.
 * @returns {Promise<boolean>} Whether the round outcome was handled.
 */
async function handleDealerRoundWin() {
  if (health > 1) {
    await animateDealerText(chooseRandomDialogue("dealerWin"), 1000, 800);
    updateHealth(-1);

    // Empty the grid and update the UI
    resetGrid();
    await performLoadShotgun();
    await performSwitchTurn();
    return true;
  }

  await handlePlayerGameOver(true);
  return true;
}

/** Displays the loss state and optionally removes one health point.
 * @param {boolean} [loseHealth=false] - Whether to deduct health before ending.
 * @returns {Promise<void>}
 */
async function handlePlayerGameOver(loseHealth = false) {
  await animateDealerText(chooseRandomDialogue("gameLose"), 1000, 800);
  playMusic("end");

  if (loseHealth) {
    updateHealth(-1);
  }

  elements.statusText.textContent = "You're lucky he's letting you live...";
  elements.endScreen.classList.add("is-visible");
}

/** Advances the player's win count and resolves the round or game victory.
 * @returns {Promise<boolean>} Whether the round outcome was handled.
 */
async function handlePlayerRoundWin() {
  winCounter++;
  updateTableBackdrop(winCounter);
  playSound("round-light");

  if (winCounter !== 2) {
    await animateDealerText(chooseRandomDialogue("playerWin"), 1000, 800);
    resetGrid();
    await performLoadShotgun();
    return true;
  }

  // Player has won 2 rounds, they win the game
  await animateDealerText(chooseRandomDialogue("gameWin"), 1000, 800);
  playSound("briefcase-show");

  elements.briefcase.disabled = false;
  elements.briefcase.classList.add("is-visible");
  return true;
}

/** Resolves a win or draw after a shot.
 * @returns {Promise<boolean>} Whether a terminal board outcome was handled.
 */
async function handleShotOutcome() {
  win = checkWin();

  if (win === "win") {
    return dealerTurn ? handleDealerRoundWin() : handlePlayerRoundWin();
  }

  if (win === "draw") {
    await animateDealerText(chooseRandomDialogue("reset"), 1000, 800);

    // Empty the grid and update the UI
    resetGrid();
    await performLoadShotgun();
    await performSwitchTurn();
    return true;
  }

  return false;
}

/** Handles a blank shot without placing a mark on the grid.
 * @returns {Promise<void>}
 */
async function handleBlankShot() {
  resetShotgun();
  playSound("blank");

  if (dealerTurn) {
    await animateDealerText(chooseRandomDialogue("mistake"), 1000, 800);
    return;
  }

  await animateDealerText(chooseRandomDialogue("blank"), 1000, 800);
}

/** Consumes the fired shell and starts the next turn or reloads the shotgun.
 * @returns {Promise<void>}
 */
async function finalizeShotTurn() {
  if (shells.length === 1) {
    // If shotgun empty, new round starts
    await performLoadShotgun();
    await performSwitchTurn();
    return;
  }

  shells.shift();
  await performSwitchTurn();
}

/** Applies a shot to an empty cell and advances gameplay as appropriate.
 * @param {HTMLElement} cell - Grid cell to update.
 * @returns {Promise<void>}
 */
async function performUpdateCell(cell) {
  if ((win || !shotgunPickedUp) && !dealerTurn) {
    return;
  }

  const index = getCellIndex(cell);

  if (grid[index] != null) {
    await animateDealerText(chooseRandomDialogue("occupied"), 1000, 800);
    return;
  }

  if (shells[0] === "blank") {
    await handleBlankShot();
  } else {
    playSound("live");
    applyShotToCell(cell, index);

    if (await handleShotOutcome()) {
      return;
    }
  }

  await finalizeShotTurn();
}

/** Clears all grid marks and resets the recorded win state.
 */
function resetGrid() {
  grid = Array(9).fill(null);
  elements.grid.querySelectorAll(".cell-mark").forEach((mark) => {
    mark.remove();
  });
  win = null;
}

/** Marks the player's turn active and announces it.
 * @returns {Promise<void>}
 */
async function handTurnToPlayer() {
  dealerTurn = false;
  await animateDealerText(chooseRandomDialogue("playerTurn"), 1000, 800);
}

/** Marks the dealer's turn active and runs the dealer's action.
 * @returns {Promise<void>}
 */
async function handTurnToDealer() {
  dealerTurn = true;
  await performActionDealerTurn();
}

/** Switches to the other participant unless an item skips the dealer's turn.
 * @returns {Promise<void>}
 */
async function performSwitchTurn() {
  if (dealerTurn) {
    await handTurnToPlayer();
    return;
  }

  if (skipTurn) {
    await animateDealerText(chooseRandomDialogue("skip"), 1000, 800);
    skipTurn = false;
    return;
  }

  await handTurnToDealer();
}

/** Checks the grid for a completed line or a draw.
 * @returns {"win"|"draw"|null} The board outcome, if one exists.
 */
function checkWin() {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    const gridStatus = [grid[a], grid[b], grid[c]];
    const uniqueValues = new Set(gridStatus);

    if (uniqueValues.size === 1 && !uniqueValues.has(null)) {
      return "win";
    }
  }

  if (!grid.includes(null)) {
    return "draw";
  }

  return null;
}

/** Changes health within its allowed range and refreshes the health display.
 * @param {number} increment - Health points to add or subtract.
 */
function updateHealth(increment) {
  if (increment < 0) {
    playSound("lose-health");
  }

  health = Math.max(0, Math.min(health + increment, MAX_HEALTH));
  updateHealthDisplay();
}
