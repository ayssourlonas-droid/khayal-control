/**
 * This is the main entry point of the application.
 * It initialises the game and sets up event listeners.
 */

/** Dismisses the initial focus prompt and arms the start button.
 * @param {MouseEvent} event - Initial page click.
 */
function activateHome(event) {
  event.preventDefault();
  event.stopPropagation();
  elements.homeLayer.querySelector(".focus-prompt").hidden = true;
  playMusic("blank-shell");
  elements.startButton.addEventListener("click", startGame);
}

document.addEventListener("click", activateHome, { capture: true, once: true });

/** Starts the game presentation and wires its controls.
 */
function startGame() {
  playMusic("background-music");

  // Fade out home screen
  elements.homeLayer.style.opacity = "0";

  setTimeout(() => {
    elements.homeLayer.style.display = "none";
  }, 500); // Wait for fade transition to complete

  // Start the game
  setupGlobalEventHandlers();
  setupInteractionHandlers();
  updateHealthDisplay();

  queueAction(() =>
    animateDealerText(chooseRandomDialogue("sign"), 1500, 1200),
  );

  // Show the waiver after the dealer text animation is complete.
  setTimeout(() => {
    // Show the waiver and animate it in from the center.
    toggleWaiver(true);
  }, 3000);

  // The game will then start once the waiver is signed, which is handled in toggleWaiver().
}

/** Registers document-level handlers for pointer lock and keyboard input.
 */
function setupGlobalEventHandlers() {
  document.addEventListener("pointerlockchange", handlePointerLockChange);
  document.addEventListener("pointerlockerror", handlePointerLockError);
  document.addEventListener("keydown", handleDocumentKeydown);
}

/** Connects the shotgun, briefcase, and restart controls to their actions.
 */
function setupInteractionHandlers() {
  elements.shotgunImage.addEventListener("click", pickupShotgun);
  elements.briefcase.addEventListener("click", () => {
    playSound("briefcase-latch");
    setTimeout(() => {
      playSound("briefcase-open");
      playMusic("end");
    }, 180);
    elements.briefcaseImage.src = "assets/briefcase/briefcase-open.png";
    elements.briefcaseImage.alt = "Opened briefcase";
    elements.briefcase.disabled = true;

    setTimeout(() => {
      elements.statusText.textContent = "Spend your winnings wisely!";
      elements.endScreen.classList.add("is-visible");
    }, 3000);
  });

  elements.restartButton.addEventListener("click", () => {
    window.location.reload();
  });
}

/** Resets aiming when the shotgun loses pointer lock.
 */
function handlePointerLockChange() {
  if (shotgunPickedUp && document.pointerLockElement === null) {
    resetShotgun();
  }
}

/** Resets aiming if pointer lock could not be acquired.
 */
function handlePointerLockError() {
  if (shotgunPickedUp && document.pointerLockElement !== document.body) {
    resetShotgun();
  }
}

/** Cancels shotgun aiming when the player presses Escape.
 * @param {KeyboardEvent} event - Keyboard event to inspect.
 */
function handleDocumentKeydown(event) {
  if (shotgunPickedUp && event.key === "Escape") {
    resetShotgun();
  }
}

/** Shows or dismisses the waiver and starts gameplay after acceptance.
 * @param {boolean} visible - Whether to display the waiver.
 * @returns {HTMLElement|undefined} The waiver element when shown.
 */
function toggleWaiver(visible) {
  const waiver = elements.waiver;

  if (!visible) {
    waiver.classList.remove("is-visible");
    waiver.classList.add("is-exiting");

    setTimeout(() => {
      waiver.classList.remove("is-exiting");
      waiver.style.display = "none";
    }, 320);

    return;
  }

  waiver.style.display = "flex";
  waiver.classList.remove("is-exiting");

  waiver.addEventListener("click", () => {
    if (waiver.classList.contains("is-exiting")) {
      return;
    }

    toggleWaiver(false);

    setTimeout(() => {
      queueAction(() =>
        animateDealerText(chooseRandomDialogue("start"), 1500, 1200),
      );
    }, 500);

    setTimeout(() => {
      document.body.classList.remove("hud-hidden");
    }, 3700);

    setTimeout(() => {
      loadShotgun();
    }, 4700);
  });

  requestAnimationFrame(() => {
    if (visible) {
      waiver.classList.add("is-visible");
    } else {
      waiver.classList.remove("is-visible");
    }
  });

  return waiver;
}
