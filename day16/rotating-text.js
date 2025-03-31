class RotatingText extends HTMLElement {
  constructor() {
    super();
    this.index = 0;
    this.texts = (this.getAttribute("texts") || "")
      .split(",")
      .map((text) => text.trim());
    this.render();
  }

  connectedCallback() {
    this.interval = setInterval(() => this.rotateText(), 2000);
  }

  disconnectedCallback() {
    clearInterval(this.interval);
  }

  rotateText() {
    const currentTextContainer = this.querySelector(".split-text");
    if (currentTextContainer) {
      currentTextContainer.classList.add("exit-animation");
    }

    setTimeout(() => {
      this.index = (this.index + 1) % this.texts.length;
      this.render();
    }, 500);
  }

  render() {
    this.innerHTML = `
            <div class="rotating-text">
                <div class="split-text">
                    ${this.texts[this.index]
                      .split("")
                      .map(
                        (char, i) =>
                          `<span style="animation-delay: ${i * 0.05}s">${
                            char === " " ? "&nbsp;" : char
                          }</span>`
                      )
                      .join("")}
                </div>
            </div>
        `;
  }
}

customElements.define("rotating-text", RotatingText);
