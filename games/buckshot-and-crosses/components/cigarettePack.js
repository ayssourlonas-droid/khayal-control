/** Inventory item that restores one point of player health. */
class CigarettePack extends InventoryItemBase {
  /** Path to the cigarette pack image. */
  get imageSource() {
    return "assets/items/cigarette-pack.png";
  }

  /** Accessible name for the item image and tooltip. */
  get altText() {
    return "Cigarette Pack";
  }

  /** Brief description of the item's effect. */
  get description() {
    return "Restores one health point, up to three.";
  }

  /** Restores one health point and consumes the item. */
  useItem() {
    // Add 1 to the player's health when the cigarette pack is used
    updateHealth(1);

    // Remove the cigarette pack from the inventory
    this.consume();
  }
}

customElements.define("cigarette-pack", CigarettePack);
