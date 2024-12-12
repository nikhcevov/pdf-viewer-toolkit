import React, { useEffect } from "react";
import { useViewerContext } from "../model/useViewerContext";
import "./Viewer.css";

export const Viewer = ({
  document,
  className,
}: {
  document: string;
  className?: string;
}) => {
  const { viewer, isLoaded, containerEl, viewerEl } = useViewerContext();

  useEffect(() => {
    if (!isLoaded || !viewer) {
      return;
    }

    viewer.setDocument(document);
  }, [document, isLoaded]);

  return (
    <div
      id="pageContainer"
      ref={containerEl}
      // Class pdfViewer-container is required with position: absolute property by pdfjs-dist
      className={`pdfViewer-container ${className}`}
    >
      {/* Class pdfViewer is added by pdfjs-dist */}
      <div id="viewer" ref={viewerEl} className="pdfViewer" />
    </div>
  );
};
