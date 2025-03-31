import {
  attrBoolean,
  clamp,
  createAnimate,
  customElements,
  each,
  easings,
  Easings,
  isMobile,
  offset,
  panGesture,
  PanGesture,
  PanGestureState,
  PropTypes,
  rubberBandClamp,
  XoComponent,
} from "@xo/utils";
import { WebComponent } from "../configureCore";

interface ScrollCarouselProps {
  xoSpeed?: number;
  xoEasing?: keyof Easings;
  xoGap?: number;
}

interface ScrollCarouselState {
  isDragging: boolean;
  x: number;
  navTarget: boolean;
  isHorizontalSwipeState?: boolean;
}

const DURATION = 1200;
const VX_OFFSET = 30;
const CLAMP_THRESHOLD = 0.3;

@customElements(WebComponent.ScrollCarousel)
export class ScrollCarousel extends XoComponent<
  ScrollCarouselProps,
  ScrollCarouselState
> {
  static propTypes: PropTypes<ScrollCarouselProps> = {
    xoSpeed: "number",
    xoGap: "number",
    xoEasing: "string",
  };

  static defaultProps: Partial<ScrollCarouselProps> = {
    xoSpeed: 200,
    xoEasing: "ease",
    xoGap: 30,
  };

  private innerEl = this.children[0] as HTMLElement;

  private animated = createAnimate();

  private pan: PanGesture | null = null;

  private nextEl = this.querySelector<HTMLElement>(
    WebComponent.ScrollCarouselNext
  );

  private prevEl = this.querySelector<HTMLElement>(
    WebComponent.ScrollCarouselPrev
  );

  private anchorEls = Array.from(this.querySelectorAll("a"));

  private isPanMove = false;

  private stopAnimated = () => {};

  state: ScrollCarouselState = {
    isDragging: false,
    x: 0,
    navTarget: false,
  };

  private endX = () => {
    const { xoGap } = this.props;
    return this.offsetWidth - this.innerEl.scrollWidth + xoGap!;
  };

  private getValue = (x: number, useRuberBand = true) => {
    const min = this.endX();
    const max = 0;
    if (useRuberBand) {
      return rubberBandClamp(min, max, x, CLAMP_THRESHOLD);
    }
    return clamp(x, min, max);
  };

  private handlePanStart = (event: MouseEvent | TouchEvent) => {
    if (
      this.nextEl?.contains(event.target as HTMLElement) ||
      this.prevEl?.contains(event.target as HTMLElement)
    ) {
      this.setState({ navTarget: true });
    }
    this.isPanMove = false;
    this.stopAnimated();
  };

  private handlePanMove = (
    { dx, isHorizontalSwipe }: PanGestureState,
    event: MouseEvent | TouchEvent
  ) => {
    const { navTarget, isHorizontalSwipeState } = this.state;
    if (navTarget) {
      return;
    }
    if (isHorizontalSwipeState == null) {
      this.setState({ isHorizontalSwipeState: isHorizontalSwipe });
    }
    const nextIsHorizontalSwipeState = isMobile.any
      ? this.state.isHorizontalSwipeState
      : true;
    if (nextIsHorizontalSwipeState) {
      event.preventDefault();
      this.isPanMove = true;
      const x = this.getValue(dx);
      this.setState({ x, isDragging: true });
    }
  };

  private handlePanEnd = ({ dx, vx }: PanGestureState) => {
    const { isDragging } = this.state;
    if (isDragging) {
      this.setState({ isDragging: false });
      this.stopAnimated = this.animated({
        from: dx,
        to: this.getValue(dx + vx * VX_OFFSET, false),
        duration: DURATION,
        easing: easings.easeOutExpo,
        onUpdate: (value) => {
          const x = this.getValue(value);
          this.setState({ x });
          this.pan?.setValue({ dx: x });
        },
      });
    }
    this.setState({ isHorizontalSwipeState: undefined, navTarget: false });
  };

  private handleWheel = (event: WheelEvent) => {
    const { deltaX, deltaY } = event;
    if (deltaY) {
      return;
    }
    event.preventDefault();
    const { x } = this.state;
    const nextX = Math.round(this.getValue(x - deltaX + (deltaX > 0 ? 1 : -1)));
    this.stopAnimated();
    this.setState({ x: nextX });
    this.pan?.setValue({ dx: nextX });
  };

  private getFirstLastEls = () => {
    const itemEls = Array.from(this.innerEl!.children) as HTMLElement[];
    let inViewportEls = itemEls.filter((el) => {
      const { left } = offset(el);
      const right = left + el.offsetWidth;
      return left >= 0 && right < window.innerWidth;
    });

    if (inViewportEls.length === 0) {
      inViewportEls = itemEls.filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.left + rect.width >= 0 && rect.left <= window.innerWidth;
      });
    }

    return {
      firstEl:
        inViewportEls.length === 1
          ? ((inViewportEls[0].previousElementSibling ||
              inViewportEls[0]) as HTMLElement)
          : inViewportEls[0],
      lastEl: inViewportEls[inViewportEls.length - 1],
    };
  };

  private handleGo = (value: number) => {
    const { xoSpeed, xoEasing } = this.props;
    const { x } = this.state;
    this.stopAnimated = this.animated({
      from: x,
      to: this.getValue(value, false),
      duration: xoSpeed,
      easing: easings[xoEasing!],
      onUpdate: (value) => {
        const x = this.getValue(value);
        this.setState({ x, navTarget: false });
        this.pan?.setValue({ dx: x });
      },
    });
    this.setState({ isHorizontalSwipeState: undefined });
  };

  private handleNext = (event: Event) => {
    event.preventDefault();
    const { x } = this.state;
    const { lastEl } = this.getFirstLastEls();
    const nextX = -(lastEl!.offsetLeft + lastEl!.offsetWidth);
    if (x !== this.endX()) {
      if (nextX === x) {
        this.handleGo(x - this.offsetWidth);
      } else {
        this.handleGo(nextX);
      }
    }
  };

  private handlePrev = (event: Event) => {
    event.preventDefault();
    const { xoGap } = this.props;
    const { x } = this.state;
    const { firstEl } = this.getFirstLastEls();
    const nextX = -(
      firstEl!.offsetLeft +
      firstEl!.offsetWidth -
      this.offsetWidth -
      xoGap!
    );
    if (x !== 0) {
      if (nextX === x) {
        this.handleGo(x + this.offsetWidth);
      } else {
        this.handleGo(nextX);
      }
    }
  };

  private handleAnchor = (event: MouseEvent) => {
    if (this.isPanMove) {
      event.preventDefault();
    }
  };

  private bindAnchor = () => {
    each(this.anchorEls, (anchorEl) => {
      anchorEl.addEventListener("click", this.handleAnchor);
    });
  };

  private unbindAnchor = () => {
    each(this.anchorEls, (anchorEl) => {
      anchorEl.removeEventListener("click", this.handleAnchor);
    });
  };

  private updateUI = () => {
    const { x } = this.state;
    this.innerEl.style.transform = `translate3d(${x}px, 0, 0)`;
    if (this.nextEl) {
      attrBoolean.set(this.nextEl, "xo-disabled", x >= 0);
    }
    if (this.prevEl) {
      attrBoolean.set(this.prevEl, "xo-disabled", x <= this.endX());
    }
  };

  mount() {
    const { xoGap } = this.props;
    if (!this.innerEl) {
      return;
    }
    this.updateUI();
    this.innerEl.style.setProperty("--xo-gap", `${xoGap}px`);
    this.bindAnchor();
    this.pan = panGesture({
      element: this,
      onStart: this.handlePanStart,
      onMove: this.handlePanMove,
      onEnd: this.handlePanEnd,
    });
    this.innerEl.addEventListener("wheel", this.handleWheel);
    this.nextEl?.addEventListener("click", this.handleNext);
    this.prevEl?.addEventListener("click", this.handlePrev);
  }

  stateUpdate() {
    this.updateUI();
  }

  unmount() {
    this.pan?.destroy();
    this.stopAnimated();
    this.unbindAnchor();
    this.innerEl.removeEventListener("wheel", this.handleWheel);
    this.nextEl?.removeEventListener("click", this.handleNext);
    this.prevEl?.removeEventListener("click", this.handlePrev);
  }
}
