/**
 * This file contains shotgun-specific interaction, pump, and reload logic.
 */

/** Queues a shotgun pump when the player is allowed to act.
 * @param {string|null} [itemUsed=null] - Item triggering the pump, if any.
 * @returns {Promise<*>|undefined} The queued pump, or undefined when blocked.
 */
function pumpShotgun(itemUsed = null) {
  if (!canPlayerUseControls()) {
    return;
  }

  return queueAction(() => performPumpShotgun(itemUsed));
}

/** Checks whether an item triggered a special pump that preserves the turn.
 * @param {string|null} itemUsed - Item triggering the pump.
 * @returns {boolean} Whether this is an item-triggered pump.
 */
function isItemPump(itemUsed) {
  return itemUsed === "expired-vodka" || itemUsed === "custom-flashlight";
}

/** Retrieves the shell affected by a pump, applying item-specific consumption.
 * @param {string|null} itemUsed - Item triggering the pump, if any.
 * @returns {string|undefined} The inspected or removed shell type.
 */
function getPumpedShell(itemUsed) {
  switch (itemUsed) {
    case "expired-vodka":
      // pump the shotgun without switching turn
      return shells.shift();

    case "custom-flashlight":
      // pump the shotgun without spending the shell
      // we only want to show the current shell without removing it
      return shells[0];

    default:
      // If pumped by player or dealer, remove the shell and clear the shotgun UI.
      resetShotgun();
      return shells.shift();
  }
}

/** Shows the pumped shell animation and waits for it to finish.
 * @param {string|undefined} currentShell - Shell type being displayed.
 * @returns {Promise<void>}
 */
async function animatePumpedShell(currentShell) {
  elements.shellLoader.innerHTML = "";

  const motionProfile = createShellMotionProfile();
  const img = createShellElement(currentShell, motionProfile);
  elements.shellLoader.appendChild(img);

  setTimeout(() => {
    img.classList.add("is-visible");
  }, 50);

  setTimeout(() => {
    img.classList.remove("is-visible");
    img.classList.add("is-loading");
  }, 1000);

  setTimeout(() => {
    elements.shellLoader.innerHTML = "";
  }, 1380);

  await delay(1500);
}

/** Reloads the shotgun only when no shells remain.
 * @returns {Promise<void>}
 */
async function reloadIfShotgunEmpty() {
  if (shells.length === 0) {
    await performLoadShotgun();
  }
}

/** Resolves a live-shell pump, including its dialogue and turn change.
 * @returns {Promise<void>}
 */
async function resolveLivePump() {
  if (dealerTurn) {
    await animateDealerText(chooseRandomDialogue("mistake"), 1000, 800);
  } else {
    await animateDealerText(chooseRandomDialogue("live"), 1000, 800);
  }

  await reloadIfShotgunEmpty();
  pumpAnimating = false;
  await performSwitchTurn();
}

/** Resolves a blank-shell pump according to whose turn it is.
 * @returns {Promise<void>}
 */
async function resolveBlankPump() {
  if (dealerTurn) {
    await reloadIfShotgunEmpty();
    pumpAnimating = false;
    await performActionDealerTurn();
    return;
  }

  // If blank pump on player turn, just show dialogue
  // Player can then take another turn
  await animateDealerText(chooseRandomDialogue("eject"), 1000, 800);
  await reloadIfShotgunEmpty();
  pumpAnimating = false;
}

/** Animates a pump and handles the resulting shell and turn effects.
 * @param {string|null} [itemUsed=null] - Item triggering the pump, if any.
 * @returns {Promise<void>}
 */
async function performPumpShotgun(itemUsed = null) {
  pumpAnimating = true;
  playSound("pump-shotgun");
  const currentShell = getPumpedShell(itemUsed);

  await animatePumpedShell(currentShell);

  if (isItemPump(itemUsed)) {
    await reloadIfShotgunEmpty();
    pumpAnimating = false;
    return;
  }

  if (currentShell !== "blank") {
    await resolveLivePump();
    return;
  }

  await resolveBlankPump();
}

/** Enters aiming mode and installs mouse, click, and pump-key handlers.
 */
function pickupShotgun() {
  if (shotgunPickedUp || !canPlayerUseControls()) {
    return;
  }

  shotgunPickedUp = true;
  setAimingMode(true);

  const gridBounds = getGridBounds();
  setAimPosition(
    gridBounds.left + gridBounds.width / 2,
    gridBounds.top + gridBounds.height / 2,
  );

  if (crosshairListener) {
    document.removeEventListener("mousemove", crosshairListener);
  }

  crosshairListener = (event) => {
    if (document.pointerLockElement !== document.body) {
      return;
    }

    const gridBounds = getGridBounds();

    // Limit the movement to a fraction of the grid size to prevent sudden jumps
    if (
      Math.abs(event.movementX) > gridBounds.width / 12 ||
      Math.abs(event.movementY) > gridBounds.height / 12
    ) {
      return;
    }

    // Update the aim position based on the mouse movement within the allowed range
    setAimPosition(
      currentAimPoint.x + event.movementX,
      currentAimPoint.y + event.movementY,
    );
  };

  document.addEventListener("mousemove", crosshairListener);

  if (shotgunClickListener) {
    document.removeEventListener("click", shotgunClickListener, true);
  }

  shotgunClickListener = (event) => {
    if (!shotgunPickedUp) {
      return;
    }

    const targetCell = getAimedGridCell();

    if (!targetCell) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    updateCell(targetCell);
  };

  document.addEventListener("click", shotgunClickListener, true);

  if (pumpListener) {
    document.removeEventListener("keydown", pumpListener);
  }

  pumpListener = (event) => {
    if (event.code === "Space" && shotgunPickedUp) {
      event.preventDefault();
      pumpShotgun();
    }
  };

  document.addEventListener("keydown", pumpListener);

  if (!document.body.requestPointerLock) {
    resetShotgun();
    return;
  }

  document.body.requestPointerLock()?.catch(handlePointerLockError);
}

/** Clears aiming state, removes shotgun listeners, and exits pointer lock.
 */
function resetShotgun() {
  shotgunPickedUp = false;
  currentAimPoint = null;
  setAimingMode(false);

  if (crosshairListener) {
    document.removeEventListener("mousemove", crosshairListener);
    crosshairListener = null;
  }

  if (shotgunClickListener) {
    document.removeEventListener("click", shotgunClickListener, true);
    shotgunClickListener = null;
  }

  if (pumpListener) {
    document.removeEventListener("keydown", pumpListener);
    pumpListener = null;
  }

  if (document.pointerLockElement) {
    document.exitPointerLock();
  }
}

/** Queues a shotgun reload and optional item generation.
 * @param {boolean} [generateItem=true] - Whether to generate a round item.
 * @returns {Promise<string[]>} The loaded shell sequence.
 */
function loadShotgun(generateItem = true) {
  return queueAction(() => performLoadShotgun(generateItem));
}

/** Generates a valid shell set, renders its load animation, and waits for it.
 * @param {boolean} [generateItem=true] - Whether to generate a round item.
 * @returns {Promise<string[]>} The loaded shell sequence.
 */
async function performLoadShotgun(generateItem = true) {
  reloading = true;

  // When loading the shotgun, this indicates a new round.
  // The player should always go first here.
  // dealerTurn = false;

  for (let i = 0; i < ITEMS_PER_ROUND; i++) {
    addItem(generateItem);
  }

  shells = createRandomShellSet();

  const uniqueShells = new Set(shells);
  if (!uniqueShells.has("x") || !uniqueShells.has("o")) {
    return performLoadShotgun(false);
  }

  const sortedShells = sortShellsForDisplay(shells);
  const shellMotionProfiles = sortedShells.map(() =>
    createShellMotionProfile(),
  );

  renderShellTray(sortedShells, shellMotionProfiles);

  const loadStartDelay =
    (sortedShells.length - 1) * SHELL_TIMINGS.dropDelay +
    SHELL_TIMINGS.dropDuration +
    SHELL_TIMINGS.settleDelay;
  const loadEndDelay =
    loadStartDelay +
    (sortedShells.length - 1) * SHELL_TIMINGS.loadDelay +
    SHELL_TIMINGS.loadDuration;

  chamberShellsIntoShotgun(sortedShells, loadStartDelay, loadEndDelay);

  await delay(loadEndDelay);

  reloading = false;

  return shells;
}

function addItem(generateItem = true) {
  if (!generateItem) {
    return null;
  }

  if (items.every((item) => item !== null)) {
    return null;
  }

  const newItem = availableItems[randint(0, availableItems.length - 1)];
  const emptySlot = items.findIndex((item) => item === null);
  items[emptySlot] = newItem;
  playSound(`item-${randint(1, 4)}`);
  updateInventoryDisplay(newItem, emptySlot);
  return { newItem, emptySlot };
}

function createRandomShellSet() {
  const shellCount = randint(2, 5);

  return Array.from(
    { length: shellCount },
    () => SHELL_TYPES[randint(0, SHELL_TYPES.length - 1)],
  );
}

function sortShellsForDisplay(shells) {
  return [...shells].sort((a, b) => SHELL_PRIORITY[a] - SHELL_PRIORITY[b]);
}

function chamberShellsIntoShotgun(sortedShells, loadStartDelay, loadEndDelay) {
  const shellLoader = elements.shellLoader;

  setTimeout(() => {
    shellLoader.classList.add("is-chambering");

    sortedShells.forEach((shell, index) => {
      const reverseIndex = sortedShells.length - 1 - index;

      setTimeout(() => {
        const shellImage = shellLoader.children[reverseIndex];
        shellImage.classList.remove("is-visible");
        shellImage.classList.add("is-loading");
        playSound("load-shell");
      }, index * SHELL_TIMINGS.loadDelay);
    });
  }, loadStartDelay);

  setTimeout(() => {
    shellLoader.classList.remove("is-chambering");
  }, loadEndDelay);
}
