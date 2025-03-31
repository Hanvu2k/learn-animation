class GridContainer extends HTMLElement {
  constructor() {
    super();
    this.style.display = "grid";
  }
  connectedCallback() {}
  disconnectedCallback() {}
}

class GridItem extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {}
  disconnectedCallback() {}
}

customElements.define("grid-container", GridContainer);
