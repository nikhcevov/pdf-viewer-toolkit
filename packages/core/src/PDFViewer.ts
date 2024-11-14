import * as pdfjsLib from 'pdfjs-dist';

/**
 * Options for the PDF viewer.
 */
interface PDFViewerOptions {
  url: string;
  canvas: HTMLCanvasElement;
  workerSrc: string;
  scale?: number;
  initialPage?: number;
}

/**
 * PDF viewer class.
 */
export class PDFViewer {
  private pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  private pageRendering: boolean;
  private pageNumPending: number | null;
  private scale: number;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pageNum: number;
  private url: string;

  constructor({ url, canvas, scale = 0.5, initialPage = 1, workerSrc }: PDFViewerOptions) {
    this.url = url;
    this.pdfDoc = null;
    this.pageRendering = false;
    this.pageNumPending = null;
    this.scale = scale;
    this.pageNum = initialPage;
    this.canvas = canvas;

    const ctx = this.canvas.getContext('2d') ?? null;
    if (ctx === null) {
      throw new Error('Canvas context not found');
    }
    this.ctx = ctx;

    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  }

  /**
   * Get the number of pages in the PDF document.
   */
  get pageCount() {
    return this.pdfDoc?.numPages ?? 0;
  }

  /**
   * Get the current page number.
   */
  get currentPage() {
    return this.pageNum;
  }

  /**
   * Initialize the PDF viewer.
   */
  async init() {
    const loadingTask = pdfjsLib.getDocument(this.url);
    this.pdfDoc = await loadingTask.promise;

    // Initial/first page rendering
    await this.renderPage(this.pageNum);
  }

  /**
   * Get page info from document, resize canvas accordingly, and render page.
   * @param num Page number.
   */
  async renderPage(num: number) {
    if (this.pageCount < num || num < 1) {
      throw new Error('Page number is out of range');
    }

    if (this.pageRendering) {
      this.pageNumPending = num;
      return;
    }

    this.pageRendering = true;
    this.pageNum = num;

    const page = await this.pdfDoc?.getPage(num);
    if (page === undefined) {
      return;
    }

    const viewport = page.getViewport({ scale: this.scale });
    // Support HiDPI-screens.
    const outputScale = window.devicePixelRatio || 1;

    this.canvas.width = Math.floor(viewport.width * outputScale);
    this.canvas.height = Math.floor(viewport.height * outputScale);
    this.canvas.style.width = `${Math.floor(viewport.width)}px`;
    this.canvas.style.height = `${Math.floor(viewport.height)}px`;

    const transform =
      outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

    // Render PDF page into canvas context
    const renderTask = page.render({
      canvasContext: this.ctx,
      transform: transform,
      viewport: viewport,
    });

    // Wait for rendering to finish
    await renderTask.promise;
    this.pageRendering = false;
    if (this.pageNumPending !== null) {
      // New page rendering is pending
      await this.renderPage(this.pageNumPending);
      this.pageNumPending = null;
    }
  }
}
