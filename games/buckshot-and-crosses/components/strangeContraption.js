/** Inventory item that applies one of several random board effects. */
class StrangeContraption extends InventoryItemBase {
  /** Path to the strange contraption image. */
  get imageSource() {
    return "assets/items/strange-contraption.png";
  }

  /** Accessible name for the item image and tooltip. */
  get altText() {
    return "Strange Contraption";
  }

  /** Brief description of the item's possible effects. */
  get description() {
    return "May undo the last shot, do nothing, or reset the board and cost one health.";
  }

  /** Applies a random board effect and consumes the item. */
  useItem() {
    // 60% revert previous shot, 30% do nothing, 10% blow up
    const roll = randint(1, 100);

    if (roll <= 60) {
      if (previousShot) {
        // Update grid + cell contents
        previousShot.cell.innerHTML = "";
        grid[previousShot.index] = null;
      }
    } else if (roll >= 90) {
      // Reset grid
      grid = Array(9).fill(null);

      // Empty all cells
      const cells = elements.grid.querySelectorAll(".grid-item");
      cells.forEach((cell) => {
        cell.innerHTML = "";
      });

      updateHealth(-1);

      if (health === 0) {
        queueAction(() => handlePlayerGameOver());
      }
    }

    // Remove the strange contraption from the inventory
    this.consume();
  }
}

customElements.define("strange-contraption", StrangeContraption);
