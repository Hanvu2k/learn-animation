class CarouselWrapper extends HTMLElement {
  constructor() {
    super();
    this.style.display = "flex";
    this.style.gap = this.getAttribute("xo-gap") || "0";
    this.style.overflow = "hidden";

    this.items = Array.from(this.children);
    this.imageSources = this.items.map((item) => item.querySelector("img").src);

    // Variables for swipe/drag
    this.isDragging = false;
    this.startPosX = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
  }

  connectedCallback() {
    this.captureInitialDimensions();

    const nextButton = document.querySelector("btn-next-carousel");
    const prevButton = document.querySelector("btn-prev-carousel");

    nextButton.addEventListener("click", () => this.next());
    prevButton.addEventListener("click", () => this.prev());

    // Add event listeners for drag/swipe on the entire carousel wrapper
    this.addEventListener("mousedown", this.startDrag.bind(this));
    this.addEventListener("touchstart", this.startDrag.bind(this));
    this.addEventListener("mouseup", this.endDrag.bind(this));
    this.addEventListener("touchend", this.endDrag.bind(this));
    this.addEventListener("mousemove", this.dragMove.bind(this));
    this.addEventListener("touchmove", this.dragMove.bind(this));

    // Prevent default actions to ensure smooth dragging behavior
    this.addEventListener("mouseleave", this.endDrag.bind(this)); // To handle cases when dragging outside the wrapper
  }

  captureInitialDimensions() {}

  next() {
    const lastSource = this.imageSources.pop();
    this.imageSources.unshift(lastSource);
    this.updateCarousel();
  }

  prev() {
    const firstSource = this.imageSources.shift();
    this.imageSources.push(firstSource);
    this.updateCarousel();
  }

  updateCarousel() {
    this.items.forEach((item, index) => {
      const img = item.querySelector("carousel-item > img");
      if (img) {
        img.src = this.imageSources[index];
      }
    });
  }

  // Drag/Swipe Start
  startDrag(event) {
    this.isDragging = true;
    this.startPosX = event.type.includes("mouse")
      ? event.pageX
      : event.touches[0].clientX;
    this.prevTranslate = this.currentTranslate;

    // Prevent text selection while dragging
    event.preventDefault();
  }

  // Drag/Swipe Movement
  dragMove(event) {
    if (!this.isDragging) return;
    const currentPosition = event.type.includes("mouse")
      ? event.pageX
      : event.touches[0].clientX;

    this.currentTranslate =
      this.prevTranslate + currentPosition - this.startPosX;
  }

  // End Drag/Swipe
  endDrag(event) {
    if (!this.isDragging) return;
    this.isDragging = false;

    const moveThreshold = 50; // Minimum pixels to count as a swipe
    const swipeDistance = this.currentTranslate - this.prevTranslate;

    if (swipeDistance > moveThreshold) {
      this.prev(); // Swipe right to go to previous
    } else if (swipeDistance < -moveThreshold) {
      this.next(); // Swipe left to go to next
    }

    // Reset translate values
    this.currentTranslate = 0;
    this.prevTranslate = 0;
  }
}

customElements.define("carousel-wrapper", CarouselWrapper);

class CarouselItem extends HTMLElement {
  constructor() {
    super();
  }
}

customElements.define("carousel-item", CarouselItem);

class BtnNextCarousel extends HTMLElement {
  constructor() {
    super();
  }
}

customElements.define("btn-next-carousel", BtnNextCarousel, {
  extends: "button",
});

class BtnPrevCarousel extends HTMLElement {
  constructor() {
    super();
  }
}

customElements.define("btn-prev-carousel", BtnPrevCarousel, {
  extends: "button",
});
