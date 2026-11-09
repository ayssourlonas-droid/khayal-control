/**
 * This file contains dealer decision-making and dealer turn execution.
 */

/** Returns the fraction of remaining shells that match the requested type.
 * @param {string} shellType - Shell type to count.
 * @returns {number} Probability from 0 to 1.
 */
function calculateShellProbabilities(shellType) {
  const totalShells = shells.length;
  return shells.filter((shell) => shell === shellType).length / totalShells;
}

/** Finds empty cells that complete a line containing two shells of the given type.
 * @param {string} shellType - Shell type to complete a winning line for.
 * @returns {HTMLElement[]} Empty grid cells that complete a line.
 */
function findWinningCells(shellType) {
  // Get all of the winning combinations which contain the free cells
  const winningCombinations = WINNING_COMBINATIONS.filter((combination) =>
    combination.some((index) => grid[index] === null),
  );

  let validWinningCombinations = [];

  // Translate combination indexes to actual cell elements
  winningCombinations.forEach((combination) => {
    const currentCombinationValues = combination.map((index) => grid[index]);
    const hasTwoOfSameType =
      currentCombinationValues.filter((value) => value === shellType).length ===
      2;

    if (hasTwoOfSameType) {
      validWinningCombinations.push(combination);
    }
  });

  let winningCells = [];

  if (validWinningCombinations.length > 0) {
    // If there's a winning combination, find the empty cell in that combination and add it to the winningCells array
    validWinningCombinations.forEach((combination) => {
      const emptyCellIndex = combination.find((index) => grid[index] === null);
      const emptyCell = elements.grid.children[emptyCellIndex];
      winningCells.push(emptyCell);
    });
  }

  return winningCells;
}

/** Selects a random cell from the supplied options.
 * @param {HTMLElement[]} cellOptions - Candidate grid cells.
 * @returns {HTMLElement} The selected cell.
 */
function selectRandomCell(cellOptions) {
  return cellOptions[randint(0, cellOptions.length - 1)];
}

/** Calculates the remaining-shell probability for each shell type.
 * @returns {{x: number, o: number, blank: number}} Probabilities by shell type.
 */
function getDealerShellChances() {
  return {
    x: calculateShellProbabilities("x"),
    o: calculateShellProbabilities("o"),
    blank: calculateShellProbabilities("blank"),
  };
}

/** Returns the shell type with the greatest probability.
 * @param {{[shellType: string]: number}} chances - Probabilities by shell type.
 * @returns {string} Shell type with the highest probability.
 */
function getHighestChanceShellType(chances) {
  return Object.keys(chances).reduce((a, b) =>
    chances[a] > chances[b] ? a : b,
  );
}

/** Returns all grid cells that do not yet contain a mark.
 * @returns {HTMLElement[]} Empty grid cells.
 */
function getUnoccupiedCells() {
  return Array.from(elements.grid.children).filter(
    (cell, index) => grid[index] === null,
  );
}

/** Chooses a winning cell, blocks the player, or picks a random, available cell.
 * @param {string} shellType - Shell type the dealer intends to place.
 * @returns {HTMLElement} The dealer's target cell.
 */
function chooseDealerTargetCell(shellType) {
  const winningCells = findWinningCells(shellType);

  if (winningCells.length > 0) {
    return selectRandomCell(winningCells);
  }

  const defensiveCells = findWinningCells(shellType === "x" ? "o" : "x");

  if (defensiveCells.length > 0) {
    return selectRandomCell(defensiveCells);
  }

  return selectRandomCell(getUnoccupiedCells());
}

/** Chooses whether the dealer should shoot or pump based on shell chances.
 * @returns {{type: string, targetCell?: HTMLElement}} The selected dealer action.
 */
function chooseDealerAction() {
  const chances = getDealerShellChances();
  const shellType = getHighestChanceShellType(chances);

  if (["x", "o"].includes(shellType)) {
    return {
      type: "shoot",
      targetCell: chooseDealerTargetCell(shellType),
    };
  }

  return { type: "pump" };
}

/** Performs a previously selected dealer action.
 * @param {{type: string, targetCell?: HTMLElement}} action - Action to execute.
 * @returns {Promise<void>}
 */
async function executeDealerAction(action) {
  if (action.type === "shoot") {
    await performUpdateCell(action.targetCell);
    return;
  }

  await performPumpShotgun();
}

/** Waits for the dealer's thinking delay, then chooses and performs an action.
 * @returns {Promise<void>}
 */
async function performActionDealerTurn() {
  await delay(1000); // Simulate dealer thinking time
  const action = chooseDealerAction();
  await executeDealerAction(action);
}
