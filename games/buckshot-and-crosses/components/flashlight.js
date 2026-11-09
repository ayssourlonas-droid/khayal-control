/** Inventory item that reveals the current shell without consuming it. */
class Flashlight extends InventoryItemBase {
  /** Path to the flashlight image. */
  get imageSource() {
    return "assets/items/flashlight.png";
  }

  /** Accessible name for the item image and tooltip. */
  get altText() {
    return "Flashlight";
  }

  /** Brief description of the item's effect. */
  get description() {
    return "Reveals the current shell without consuming it.";
  }

  /** Reveals the current shell without consuming it, then consumes the item. */
  useItem() {
    // Reveal current shell to player
    pumpShotgun("custom-flashlight");

    // Remove the flashlight from the inventory
    this.consume();
  }
}

customElements.define("custom-flashlight", Flashlight);
