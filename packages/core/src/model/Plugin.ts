import type { PDFViewer } from 'pdfjs-dist/web/pdf_viewer.mjs';

export interface PluginProps {
  viewer: PDFViewer;
}

/**
 * Base class for PDF viewer plugins. Use it as a template for your own plugins.
 */
export class Plugin {
  public viewer: PDFViewer;

  constructor({ viewer }: PluginProps) {
    this.viewer = viewer;
  }

  public load(): void {
    throw new Error('Method not implemented.');
  }

  public unload(): void {
    throw new Error('Method not implemented.');
  }
}
