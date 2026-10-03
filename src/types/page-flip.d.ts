// O pacote page-flip (MIT) publica so o JavaScript. Aqui fica apenas o que o
// leitor de edicoes usa.
declare module "page-flip" {
  export type FlipSetting = {
    width: number;
    height: number;
    size: "fixed" | "stretch";
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    showCover: boolean;
    usePortrait: boolean;
    drawShadow: boolean;
    maxShadowOpacity: number;
    flippingTime: number;
    mobileScrollSupport: boolean;
    showPageCorners: boolean;
    startPage: number;
  };

  export class PageFlip {
    constructor(element: HTMLElement, settings: Partial<FlipSetting>);
    loadFromHTML(items: HTMLElement[] | NodeListOf<HTMLElement>): void;
    flipNext(): void;
    flipPrev(): void;
    flip(page: number): void;
    turnToPage(page: number): void;
    getPageCount(): number;
    getCurrentPageIndex(): number;
    getOrientation(): "portrait" | "landscape";
    update(): void;
    destroy(): void;
    on(
      event: "flip" | "init" | "changeOrientation",
      callback: (event: { data: unknown }) => void,
    ): this;
  }
}
