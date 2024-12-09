import { EventBus } from "../lib/EventBus";
import { Plugin } from "./Plugin";

import type { PluginProps } from "./Plugin";
import type { PDFPageView } from "pdfjs-dist/web/pdf_viewer.mjs";

interface EventWithPageNumber {
  pageNumber: number;
}
const makeCanvasElementId = (pageNumber: number) =>
  `page-editor-canvas-${pageNumber}`;

/**
 * Class provides methods to work with viewer canvas editor.
 * Use it as a template for your own plugins, to implement
 * any drawing functionality.
 *
 * Provides document-wide methods:
 *  - `toggleEditor` - to toggle editor layer (render/destroy editor canvas elements)
 *
 * Provides page-wide events:
 *  - `pagerender` - when page is rendered
 *  - `pagereset` - when page is reseted (page is being removed from cache, and canvas destroyed)
 */
export class EditorPlugin extends Plugin {
  private isEditorLayerEnabled: boolean;
  private editorEventBus: EventBus;
  private currentPageNumbers: number[];

  constructor({ viewer }: PluginProps) {
    super({ viewer });
    this.isEditorLayerEnabled = false;
    this.editorEventBus = new EventBus();
    this.currentPageNumbers = [];

    this.load = this.load.bind(this);
    this.unload = this.unload.bind(this);
    this._toggleEditor = this._toggleEditor.bind(this);
    this._getPageEditorCanvas = this._getPageEditorCanvas.bind(this);
  }

  public load(): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.viewr = this.viewer;
    // const makeSafe = function (fn) {
    //   return function () {
    //     try {
    //       console.log(arguments);
    //       return fn.apply(this, arguments);
    //     } catch (ex) {
    //       console.log(ex);
    //     }
    //   };
    // };
    // this.viewer.eventBus.dispatch = makeSafe(this.viewer.eventBus.dispatch);

    this.viewer.eventBus.on("pagerender", this.onPageRender);
    this.viewer.eventBus.on("textlayerrendered", this.onTextLayerRendered);
    this.viewer.eventBus.on("pagerendered", this.onPageRendered);
  }

  // TODO: Implement properly
  public unload(): void {
    this.viewer.eventBus.off("pagerender", this.onPageRender);
    this.viewer.eventBus.on("textlayerrendered", this.onTextLayerRendered);
    this.viewer.eventBus.off("pagerendered", this.onPageRendered);
  }

  /**
   * Toggle editor layer (render/destroy editor canvas elements)
   */
  public _toggleEditor() {
    if (this.isEditorLayerEnabled) {
      this.isEditorLayerEnabled = false;
      this._pages.forEach((page) =>
        this.destroyPageEditorElement({ pageNumber: page.id })
      );
    } else {
      this.isEditorLayerEnabled = true;
      this._pages.forEach((page) =>
        this.renderPageCanvas({ pageNumber: page.id })
      );
    }
  }

  /**
   * Returns `true` if editor is enabled
   */
  public get isEditorEnabled() {
    return this.isEditorLayerEnabled;
  }

  /**
   * @returns Set of pages, which are currently rendered
   */
  public get _pages(): Set<PDFPageView> {
    return this.viewer.getCachedPageViews();
  }

  /**
   * @returns Array of rendered page numbers
   */
  public get _pageNumbers(): number[] {
    return [...this._pages].map((page) => page.id);
  }

  public _getPageByNumber(pageNumber: number) {
    const pages = this._pages;
    return [...pages].find((page) => page.id === pageNumber);
  }

  /**
   * @returns Current zoom level
   */
  public get _zoom() {
    return this.viewer.currentScale;
  }

  /**
   * @returns // TODO: write doc
   */
  public get _editorEventBus() {
    return this.editorEventBus;
  }

  /**
   * Get canvas element for the page
   * @param page Page to get canvas for
   * @returns Canvas element for the page
   */
  public _getPageEditorCanvas(pageNumber: number) {
    const elementId = makeCanvasElementId(pageNumber);
    const element = document.getElementById(elementId) as HTMLCanvasElement;
    return element;
  }

  private getPageEditorLayer = (page: PDFPageView) => {
    const pageElement = page.div;

    if (!pageElement) {
      throw new Error("Page element not found");
    }

    return pageElement;
  };

  private destroyPageEditorElement = ({ pageNumber }: EventWithPageNumber) => {
    const page = this._getPageByNumber(pageNumber);
    if (!page) {
      return;
    }

    this.toggleTextLayerVisibility({ pageNumber, isVisible: true });

    const editorLayer = this.getPageEditorLayer(page);
    const editorCanvas = this._getPageEditorCanvas(pageNumber);
    editorLayer.removeChild(editorCanvas);
  };

  private renderPageCanvas = ({ pageNumber }: EventWithPageNumber) => {
    const page = this._getPageByNumber(pageNumber);
    if (!page) {
      return;
    }

    const existedEditorCanvas = this._getPageEditorCanvas(pageNumber);
    if (existedEditorCanvas) {
      this.syncCanvasDimensions(page);
      return;
    }

    page.textLayer?.hide();

    // Canvas is recreated on each page render - it is not possible to update width & height without canvas remount in DOM.
    const canvasElement = document.createElement("canvas");
    canvasElement.id = makeCanvasElementId(pageNumber);
    canvasElement.style.position = "absolute";
    canvasElement.style.inset = "0";

    const editorLayer = this.getPageEditorLayer(page);
    this.syncCanvasDimensions(page, canvasElement);
    editorLayer.appendChild(canvasElement);
  };

  private syncCanvasDimensions = (
    page: PDFPageView,
    canvas?: HTMLCanvasElement
  ) => {
    const canvasElement = canvas ?? this._getPageEditorCanvas(page.id);
    // TODO: Find a way to get page canvas height and width without page.canvas property
    if (page.canvas) {
      canvasElement.width = page.canvas.width;
      canvasElement.height = page.canvas.height;
    }
  };

  private onPageRender = () => {
    // When page is rendered, there is a chance that one of
    // previous pages is being reseted, so we need to clear
    // memory
    // At the moment, we can't detect this event (smt like "pagereset")
    // so we need to listen to it and clear memory manually
    // TODO: Find a way to detect this event and clear memory with pdfjs
    const prevPageNumbers = this.currentPageNumbers;

    const currentPageNumbers: number[] = [];
    this._pages.forEach((page) => {
      currentPageNumbers.push(page.id);
    });

    for (const id of prevPageNumbers) {
      if (!currentPageNumbers.includes(id)) {
        this.editorEventBus.dispatch("pagereset", { pageNumber: id });
      }
    }

    this.currentPageNumbers = currentPageNumbers;
  };

  private onPageRendered = ({ pageNumber }: EventWithPageNumber) => {
    if (this.isEditorLayerEnabled) {
      this.renderPageCanvas({ pageNumber });
      this.editorEventBus.dispatch("pagerender", { pageNumber });
    }
  };

  private toggleTextLayerVisibility = ({
    pageNumber,
    isVisible,
  }: {
    pageNumber: number;
    isVisible: boolean;
  }) => {
    const page = this._getPageByNumber(pageNumber);

    if (isVisible) {
      page?.textLayer?.show();
    } else {
      page?.textLayer?.hide();
    }
  };

  /**
   * This event is fired when the text layer is rendered (which happens as separate event, after page render event).
   * We need to hide text layer to prevent text selection.
   */
  private onTextLayerRendered = ({ pageNumber }: EventWithPageNumber) => {
    if (this.isEditorLayerEnabled) {
      this.toggleTextLayerVisibility({ pageNumber, isVisible: false });
    }
  };
}
