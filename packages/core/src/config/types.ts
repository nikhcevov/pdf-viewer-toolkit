/**
 * Event fired on any page render like zooming, scrolling, etc.
 */
export interface PageRenderEvent {
  /**
   * Number of page
   */
  pageNumber: number;
  /**
   * Height of page in pixels
   */
  height: number;
  /**
   * Width of page in pixels
   */
  width: number;
}

/**
 * Event fired when page canvas destroyed in DOM
 */
export interface PageResetEvent {
  /**
   * Number of page
   */
  pageNumber: number;
}
