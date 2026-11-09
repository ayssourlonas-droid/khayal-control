/**
 * This file contains utility functions that are used throughout the application.
 * These functions can be reused in different parts of the codebase, promoting code reusability and maintainability.
 */

/** Returns a random integer in the inclusive range.
 * @param {number} min - Smallest possible integer.
 * @param {number} max - Largest possible integer.
 * @returns {number} Random integer in the range.
 */
function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Returns a random floating-point value in the half-open range [min, max).
 * @param {number} min - Inclusive lower bound.
 * @param {number} max - Exclusive upper bound.
 * @returns {number} Random floating-point value.
 */
function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/** Formats a random value with the requested CSS unit and precision.
 * @param {number} min - Inclusive lower bound.
 * @param {number} max - Exclusive upper bound.
 * @param {string} unit - CSS unit suffix.
 * @param {number} [precision=2] - Decimal places to retain.
 * @returns {string} Formatted CSS value.
 */
function randomUnit(min, max, unit, precision = 2) {
  return `${randomFloat(min, max).toFixed(precision)}${unit}`;
}

/** Restricts a number to the inclusive range between min and max.
 * @param {number} value - Number to restrict.
 * @param {number} min - Lower bound.
 * @param {number} max - Upper bound.
 * @returns {number} The bounded value.
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Creates randomized CSS motion values for one shell animation.
 * @returns {Object<string, string>} CSS custom-property values.
 */
function createShellMotionProfile() {
  return {
    dropX: randomUnit(-1.8, 1.8, "rem"),
    dropRotate: randomUnit(-13, 13, "deg", 1),
    restX: randomUnit(-0.4, 0.4, "rem"),
    restY: randomUnit(-0.08, 0.08, "rem"),
    restRotate: randomUnit(-2.2, 2.2, "deg", 1),
    loadX: randomUnit(7.6, 9.6, "rem"),
    loadY: randomUnit(-1.6, -0.55, "rem"),
    loadRotate: randomUnit(10, 19, "deg", 1),
  };
}
