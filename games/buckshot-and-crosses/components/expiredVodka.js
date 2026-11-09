/** Inventory item that discards the current shell without ending the turn. */
class ExpiredVodka extends InventoryItemBase {
  /** Path to the expired vodka image. */
  get imageSource() {
    return "assets/items/expired-vodka.png";
  }

  /** Accessible name for the item image and tooltip. */
  get altText() {
    return "Expired Vodka";
  }

  /** Brief description of the item's effect. */
  get description() {
    return "Pumps and discards the current shell without ending your turn.";
  }

  /** Pumps and discards the current shell without ending the player's turn. */
  useItem() {
    // Pumps the shotgun, giving the user a second turn, regardless of the current shell.
    pumpShotgun("expired-vodka");

    // Remove the expired vodka from the inventory
    this.consume();
  }
}

customElements.define("expired-vodka", ExpiredVodka);
