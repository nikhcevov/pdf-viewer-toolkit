import React, { useEffect } from "react";
import { useInternalViewerContext } from "../model/useInternalViewerContext";

export const Viewer = ({
  document,
  className,
}: {
  document: string;
  className?: string;
}) => {
  const { viewer, isLoaded, viewerEl, containerEl } =
    useInternalViewerContext();

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
      className={className}
      // Position absolute is required for correct positioning of the viewer
      style={{ position: "absolute" }}
    >
      {/* Class `pdfViewer` is added by pdfjs-dist */}
      <div id="viewer" ref={viewerEl} className="pdfViewer" />
    </div>
  );
};
