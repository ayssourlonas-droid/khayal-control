/** Inventory item that skips the dealer's next turn. */
class Jammer extends InventoryItemBase {
  /** Path to the jammer image. */
  get imageSource() {
    return "assets/items/jammer.png";
  }

  /** Accessible name for the item image and tooltip. */
  get altText() {
    return "Jammer";
  }

  /** Brief description of the item's effect. */
  get description() {
    return "Skips the dealer's next turn.";
  }

  /** Marks the dealer's next turn to be skipped and consumes the item. */
  useItem() {
    skipTurn = true;
    this.consume();
  }
}

customElements.define("custom-jammer", Jammer);
