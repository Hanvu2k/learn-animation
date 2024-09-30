class CarouselWrapper extends HTMLElement {
  constructor() {
    super();
    this.items = Array.from(this.children); // Lưu trữ tất cả các item
    this.currentIndex = 0; // Chỉ số hiện tại
    this.updateCarousel(); // Cập nhật carousel ban đầu
    this.style.gap = this.getAttribute("xo-gap") || "0rem";

    // Biến để lưu trạng thái kéo
    this.isDragging = false;
    this.startPosX = 0;
    this.prevTranslate = 0;

    // Lấy width của item đầu tiên để tính toán
    this.itemWidth = this.items[0]?.getBoundingClientRect().width || 0;
  }

  connectedCallback() {
    const nextButton = document.querySelector("btn-next-carousel");
    const prevButton = document.querySelector("btn-prev-carousel");

    nextButton.addEventListener("click", () => this.next());
    prevButton.addEventListener("click", () => this.prev());

    // Thêm các sự kiện cho kéo/thả
    this.addEventListener("mousedown", this.startDrag.bind(this));
    this.addEventListener("touchstart", this.startDrag.bind(this));
    this.addEventListener("mouseup", this.endDrag.bind(this));
    this.addEventListener("touchend", this.endDrag.bind(this));
    this.addEventListener("mousemove", this.dragMove.bind(this));
    this.addEventListener("touchmove", this.dragMove.bind(this));
    this.addEventListener("mouseleave", this.endDrag.bind(this));
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.updateCarousel();
  }

  prev() {
    this.currentIndex =
      (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.updateCarousel();
  }

  updateCarousel() {
    const offset = -this.currentIndex * this.itemWidth;
    this.items.forEach((item) => {
      item.style.transform = `translateX(${offset}px)`; // Sử dụng px cho chuyển động
      item.style.transition = "transform 0.5s ease";
    });
  }

  startDrag(event) {
    this.isDragging = true;
    this.startPosX = event.type.includes("mouse")
      ? event.pageX
      : event.touches[0].clientX;
    this.prevTranslate = -this.currentIndex * this.itemWidth;
    event.preventDefault();
  }

  dragMove(event) {
    if (!this.isDragging) return;
    const currentPosition = event.type.includes("mouse")
      ? event.pageX
      : event.touches[0].clientX;
    const currentTranslate =
      this.prevTranslate +
      ((currentPosition - this.startPosX) / window.innerWidth) * 100; // Giữ nguyên cách tính toán tỷ lệ
    this.items.forEach((item) => {
      item.style.transform = `translateX(${currentTranslate}px)`; // Sử dụng px cho di chuyển
    });
  }

  endDrag(event) {
    if (!this.isDragging) return;
    this.isDragging = false;

    const moveThreshold = 30;
    const swipeDistance =
      ((this.prevTranslate +
        (event.type.includes("mouse")
          ? event.pageX
          : event.touches[0].clientX) -
        this.startPosX) /
        window.innerWidth) *
      100;

    if (swipeDistance > moveThreshold) {
      this.prev();
    } else if (swipeDistance < -moveThreshold) {
      this.next();
    } else {
      this.updateCarousel();
    }
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

customElements.define("btn-next-carousel", BtnNextCarousel);

class BtnPrevCarousel extends HTMLElement {
  constructor() {
    super();
  }
}

customElements.define("btn-prev-carousel", BtnPrevCarousel);
