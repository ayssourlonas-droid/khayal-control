/**
 * This file defines shared runtime state, DOM references, and constants.
 */

// Core gameplay state
let grid = Array(9).fill(null);
let win = null;
let dealerTurn = false;
let skipTurn = false;
let winCounter = 0;
let health = 2;
let previousShot;
let items = Array(2).fill(null);

// Shotgun and aiming state
let shells;
let shotgunPickedUp = false;
let reloading = false;
let pumpAnimating = false;
let currentAimPoint = null;
let crosshairListener = null;
let shotgunClickListener = null;
let pumpListener = null;

// Action queue state
let actionQueue = Promise.resolve();
let actionQueueRunning = false;

// Visual and gameplay configuration
const CROSSHAIR_OFFSET_X = 817.5;
const CROSSHAIR_OFFSET_Y = 210;

// When changing this, also update the CSS variable --max-health in src/styles/main.css
const MAX_HEALTH = 3;
const ITEMS_PER_ROUND = 1;

const SHELL_TYPES = ["x", "o", "blank"];
const SHELL_PRIORITY = { x: 1, o: 2, blank: 3 };
const SHELL_TIMINGS = {
  dropDelay: 220,
  dropDuration: 700,
  settleDelay: 350,
  loadDelay: 165,
  loadDuration: 340,
};

const availableItems = [
  "custom-jammer",
  "custom-flashlight",
  "cigarette-pack",
  "strange-contraption",
  "expired-vodka",
];

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Cached DOM references
const elements = {
  grid: document.getElementById("grid"),
  gameContainer: document.getElementById("game-container"),
  shellContainer: document.getElementById("shell-container"),
  shellLoader: document.getElementById("shell-loader"),
  shotgunContainer: document.getElementById("shotgun-container"),
  shotgunImage: document.getElementById("shotgun-image"),
  healthContainer: document.getElementById("health-container"),
  crosshair: document.getElementById("crosshair"),
  vignette: document.getElementById("vignette"),
  inventory: document.getElementById("inventory"),
  inventorySlots: [
    document.getElementById("item-slot-1"),
    document.getElementById("item-slot-2"),
  ],
  dealerContainer: document.getElementById("dealer-container"),
  dealerText: document.getElementById("dealer-text"),
  tableBackdrop: document.getElementById("table-backdrop"),
  waiver: document.getElementById("waiver"),
  briefcase: document.getElementById("briefcase"),
  briefcaseImage: document.getElementById("briefcase-image"),
  statusText: document.getElementById("status-text"),
  endScreen: document.getElementById("end-screen"),
  restartButton: document.getElementById("restart-button"),
  homeLayer: document.querySelector(".home-layer"),
  startButton: document.getElementById("start-button"),
};

/** Reports whether player input is allowed in the current game state.
 * @returns {boolean} Whether controls can be used.
 */
function canPlayerUseControls() {
  return !(
    dealerTurn ||
    actionQueueRunning ||
    reloading ||
    pumpAnimating ||
    health <= 0 ||
    winCounter >= 2
  );
}

/** Runs an action after prior queued actions and updates control availability.
 * @param {Function} action - Action to run in sequence.
 * @returns {Promise<*>} The action's result.
 */
function queueAction(action) {
  const queuedAction = actionQueue.then(async () => {
    actionQueueRunning = true;
    updatePlayerControls();

    try {
      return await action();
    } finally {
      actionQueueRunning = false;
      updatePlayerControls();
    }
  });

  actionQueue = queuedAction.then(
    () => undefined,
    () => undefined,
  );

  return queuedAction;
}
