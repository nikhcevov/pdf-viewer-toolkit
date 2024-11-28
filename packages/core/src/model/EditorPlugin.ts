import { Plugin } from "./Plugin";

import type { PluginProps } from "./Plugin";
import type { AnnotationEditorLayer } from "pdfjs-dist";
import type { PDFPageView } from "pdfjs-dist/web/pdf_viewer.mjs";
import { EventBus } from "pdfjs-dist/web/pdf_viewer.mjs";

const makeEditorElementId = (page: PDFPageView) =>
  `page-editor-layer-${page.id}`;
const makeCanvasElementId = (page: PDFPageView) =>
  `page-editor-canvas-${page.id}`;

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
  private eventBus: EventBus;
  private currentPageNumbers: number[];

  constructor({ viewer }: PluginProps) {
    super({ viewer });
    this.isEditorLayerEnabled = false;
    this.eventBus = new EventBus();
    this.currentPageNumbers = [];

    this.load = this.load.bind(this);
    this.unload = this.unload.bind(this);
    this._toggleEditor = this._toggleEditor.bind(this);
    this._getPageCanvas = this._getPageCanvas.bind(this);
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
    this.viewer.eventBus.on(
      "annotationeditorlayerrendered",
      this.onPageEditorLayerRendered
    );
  }

  // TODO: Implement properly
  public unload(): void {
    this.viewer.eventBus.off("pagerender", this.onPageRender);
    this.viewer.eventBus.off(
      "annotationeditorlayerrendered",
      this.onPageEditorLayerRendered
    );
  }

  /**
   * Toggle editor layer (render/destroy editor canvas elements)
   */
  public _toggleEditor() {
    console.log("--1");
    if (this.isEditorLayerEnabled) {
      this.isEditorLayerEnabled = false;
      this._pages.forEach((page) =>
        this.destroyPageEditorElement({ pageNumber: page.id })
      );
    } else {
      this.isEditorLayerEnabled = true;
      this._pages.forEach((page) =>
        this.renderPageEditorElement({ pageNumber: page.id })
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
    return this.eventBus;
  }

  /**
   * Get canvas element for the page
   * @param page Page to get canvas for
   * @returns Canvas element for the page
   */
  public _getPageCanvas(page: PDFPageView) {
    const elementId = makeCanvasElementId(page);
    const element = document.getElementById(elementId) as HTMLCanvasElement;
    return element;
  }

  private getPageEditorLayer = (page: PDFPageView) => {
    const editorLayer: AnnotationEditorLayer = page.annotationEditorLayer;
    return editorLayer.div;
  };

  private getPageCanvasWrapper = (page: PDFPageView) => {
    const elementId = makeEditorElementId(page);
    const element = document.getElementById(elementId) as HTMLDivElement;
    return element;
  };

  private destroyPageEditorElement = ({
    pageNumber,
  }: {
    pageNumber: number;
  }) => {
    const page = this._getPageByNumber(pageNumber);
    if (!page) {
      return;
    }

    page.textLayer?.show();
    const editorLayer = this.getPageEditorLayer(page);
    editorLayer.classList.add("disabled");
    const editorElement = this.getPageCanvasWrapper(page);
    editorLayer.removeChild(editorElement);
  };

  private renderPageEditorElement = ({
    pageNumber,
  }: {
    pageNumber: number;
  }) => {
    const page = this._getPageByNumber(pageNumber);
    if (!page) {
      return;
    }

    const existedEditorElement = this.getPageCanvasWrapper(page);

    if (existedEditorElement) {
      this.updatePage(page);
      return;
    }

    page.textLayer?.hide();

    const editorLayer = this.getPageEditorLayer(page);
    editorLayer.classList.remove("disabled");
    const editorElement = document.createElement("div");
    editorElement.id = makeEditorElementId(page);
    editorElement.style.height = "100%";
    editorElement.style.width = "100%";
    editorLayer.appendChild(editorElement);

    const canvasElement = document.createElement("canvas");
    canvasElement.id = makeCanvasElementId(page);
    canvasElement.style.height = "100%";
    canvasElement.style.width = "100%";
    // TODO: Find a way to get page canvas height and width without page.canvas property
    if (page.canvas) {
      canvasElement.height = page.canvas.height;
      canvasElement.width = page.canvas.width;
    }
    editorElement.appendChild(canvasElement);
    editorLayer.removeAttribute("hidden");
  };

  private updatePage = (page: PDFPageView) => {
    const editorLayer = this.getPageEditorLayer(page);
    editorLayer.removeAttribute("hidden");

    const canvasElement = this._getPageCanvas(page);
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
        this.eventBus.dispatch("pagereset", { pageNumber: id });
      }
    }

    this.currentPageNumbers = currentPageNumbers;
  };

  private onPageEditorLayerRendered = ({
    pageNumber,
  }: {
    pageNumber: number;
  }) => {
    if (this.isEditorLayerEnabled) {
      this.renderPageEditorElement({ pageNumber });
      this.eventBus.dispatch("pagerender", { pageNumber });
    }
  };
}
