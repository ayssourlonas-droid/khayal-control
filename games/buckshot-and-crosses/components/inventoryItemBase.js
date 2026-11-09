/** Shared rendering, slot access, and consumption behavior for inventory items. */
class InventoryItemBase extends HTMLElement {
  /** Renders the item and connects its click action when added to the document. */
  connectedCallback() {
    this.renderItem();
    this.addEventListener("click", () => {
      if (!canPlayerUseControls()) {
        return;
      }

      const itemSounds = {
        "cigarette-pack": "cigarette",
        "custom-flashlight": "flashlight",
        "custom-jammer": "jammer",
        "expired-vodka": "vodka",
        "strange-contraption": "contraption",
      };
      playSound(itemSounds[this.localName]);
      this.useItem(this.slot);
    });
  }

  /** Zero-based inventory slot occupied by this element. */
  get slot() {
    return Number(this.dataset.slot);
  }

  /** Renders the item's image and tooltip from subclass metadata. */
  renderItem() {
    this.innerHTML = `
      <img src="${this.imageSource}" alt="${this.altText}" class="inventory-item" />
      <span class="item-tooltip" role="tooltip"><strong>${this.altText}</strong>${this.description}</span>
    `;
  }

  /** Clears this item's slot in the shared inventory state. */
  clearSlot() {
    items[this.slot] = null;
  }

  /** Removes the item element and clears its inventory slot. */
  consume() {
    this.remove();
    this.clearSlot();
  }
}
