import * as pdfjsLib from "pdfjs-dist";
import {
  PDFViewer as PDFViewerClass,
  EventBus,
} from "pdfjs-dist/web/pdf_viewer.mjs";

import "pdfjs-dist/web/pdf_viewer.css";
import type { Plugin } from "./Plugin";

/**
 * Options for the PDF viewer.
 */
interface PDFViewerOptions {
  /**
   * The HTML element to display the PDF in.
   */
  viewer: HTMLDivElement;
  /**
   * The HTML element to display the pages in.
   */
  container: HTMLDivElement;
  /**
   * Worker source URL.
   * @default 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.mjs'
   */
  workerSrc?: string;
  /**
   * Annotation mode.
   * @default 'DISABLE'
   */
  annotationMode?: keyof typeof pdfjsLib.AnnotationMode;
}

/**
 * PDF viewer class.
 */
export class PDFViewer {
  public viewer: PDFViewerClass;

  constructor({
    viewer,
    container,
    workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.mjs",
    annotationMode,
  }: PDFViewerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

    const eventBus = new EventBus();
    this.viewer = new PDFViewerClass({
      viewer,
      container,
      eventBus: eventBus,
      enableHWA: true,
      annotationMode: pdfjsLib.AnnotationMode[annotationMode || "DISABLE"],
    });
    this.viewer.eventBus.on("pagesinit", this.onPagesInit);
  }

  /**
   * Method to destroy the viewer
   */
  public destroy() {
    this.viewer.pdfDocument?.destroy();
    this.viewer.eventBus.off("pagesinit", this.onPagesInit);
  }

  private onPagesInit = () => {
    this.viewer.currentScaleValue = "auto";
  };

  /**
   * Sets the document to display.
   * @param documentUrl - The URL of the PDF document.
   */
  public setDocument = async (documentUrl: string) => {
    const loadingTask = pdfjsLib.getDocument(documentUrl);
    const document = await loadingTask.promise;
    this.viewer.setDocument(document);
  };

  /**
   * Loads a plugin.
   */
  loadPlugin = (plugin: Plugin) => {
    plugin.load();
  };
}
