import { Plugin } from './Plugin';

import type { PluginProps } from './Plugin';
import type { AnnotationEditorLayer } from 'pdfjs-dist';
import type { PDFPageView } from 'pdfjs-dist/web/pdf_viewer.mjs';

const makeEditorElementId = (page: PDFPageView) => `page-editor-layer-${page.id}`;
const makeCanvasElementId = (page: PDFPageView) => `page-editor-canvas-${page.id}`;

export class EditorPlugin extends Plugin {
  private isEditorLayerEnabled: boolean;

  constructor({ viewer }: PluginProps) {
    super({ viewer });
    this.isEditorLayerEnabled = false;
  }

  public load(): void {
    //
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.viewr = this.viewer;
    //
    // const onMouseDown: EventListener = (event) => {
    //   const { offsetX, offsetY } = event as MouseEvent;
    //   console.log('event', offsetX, offsetY);
    // };
    //
    this.viewer.eventBus.on('annotationeditorlayerrendered', this.onPageEditorLayerRendered);
    this.viewer.eventBus.on('scalechanging', this.onScaleChanging);
  }

  public unload(): void {
    this.viewer.eventBus.off('annotationeditorlayerrendered', this.onPageEditorLayerRendered);
  }

  public _toggleEditor = () => {
    if (this.isEditorLayerEnabled) {
      this.isEditorLayerEnabled = false;
      this.destroyEditorElements();
    } else {
      this.isEditorLayerEnabled = true;
      this.renderEditorElements();
    }
  };

  public get _pages() {
    const pages: Set<PDFPageView> = this.viewer.getCachedPageViews();
    return pages;
  }

  private getPageEditorLayer = (page: PDFPageView) => {
    const editorLayer: AnnotationEditorLayer = page.annotationEditorLayer;
    return editorLayer.div;
  };

  public _getPageEditorWrapper = (page: PDFPageView) => {
    const elementId = makeEditorElementId(page);
    const element = document.getElementById(elementId) as HTMLDivElement;
    return element;
  };

  public _getPageEditorCanvas = (page: PDFPageView) => {
    const elementId = makeCanvasElementId(page);
    const element = document.getElementById(elementId) as HTMLCanvasElement;
    return element;
  };

  private destroyEditorElements = () => {
    const cachedPages = this.viewer.getCachedPageViews();

    cachedPages.forEach((page: PDFPageView) => {
      page.textLayer?.show();

      const editorLayer = this.getPageEditorLayer(page);
      editorLayer.classList.add('disabled');
      const editorElement = this._getPageEditorWrapper(page);
      editorLayer.removeChild(editorElement);
    });
  };

  private renderEditorElements = () => {
    const cachedPages = this.viewer.getCachedPageViews();

    cachedPages.forEach((page: PDFPageView) => {
      const existedEditorElement = this._getPageEditorWrapper(page);
      if (existedEditorElement) {
        return;
      }

      page.textLayer?.hide();

      const editorLayer = this.getPageEditorLayer(page);
      editorLayer.classList.remove('disabled');
      const editorElement = document.createElement('div');
      editorElement.id = makeEditorElementId(page);
      editorElement.style.height = '100%';
      editorElement.style.width = '100%';
      editorLayer.appendChild(editorElement);

      const canvasElement = document.createElement('canvas');
      canvasElement.id = makeCanvasElementId(page);
      canvasElement.style.height = '100%';
      canvasElement.style.width = '100%';
      // TODO: Find a way to get page canvas height and width without page.canvas property
      if (page.canvas) {
        canvasElement.height = page.canvas.height;
        canvasElement.width = page.canvas.width;
      }
      editorElement.appendChild(canvasElement);

      editorLayer.removeAttribute('hidden');
      page.canvas?.height;
    });
  };

  private updateEditorElements = () => {
    const cachedPages = this.viewer.getCachedPageViews();

    cachedPages.forEach((page: PDFPageView) => {
      const editorLayer = this.getPageEditorLayer(page);
      editorLayer.removeAttribute('hidden');

      const canvasElement = this._getPageEditorCanvas(page);
      // TODO: Find a way to get page canvas height and width without page.canvas property
      if (page.canvas) {
        canvasElement.height = page.canvas.height;
        canvasElement.width = page.canvas.width;
      }
    });
  };

  private onPageEditorLayerRendered = () => {
    if (this.isEditorLayerEnabled) {
      this.updateEditorElements();
    }
  };

  private onScaleChanging = () => {
    if (this.isEditorLayerEnabled) {
      this.updateEditorElements();
    }
  };
}
