import { useViewerContext, Viewer } from "@pdf-viewer-toolkit/react";
import React from "react";
import "./styles.css";

export const App = () => {
  const { viewer } = useViewerContext();

  const onPrevPage = () => {
    viewer?.viewer.previousPage();
  };

  const onNextPage = () => {
    viewer?.viewer.nextPage();
  };

  const onScaleMinus = () => {
    viewer?.viewer.decreaseScale();
  };

  const onScalePlus = () => {
    viewer?.viewer.increaseScale();
  };

  return (
    <div className="App">
      <div>
        <span>
          Page:
          <button onClick={onPrevPage} type="button">
            Previous
          </button>
          <button onClick={onNextPage} type="button">
            Next
          </button>
        </span>

        <br />
        <span>
          Scale:
          <button onClick={onScalePlus} type="button">
            +
          </button>
          <button onClick={onScaleMinus} type="button">
            -
          </button>
        </span>
      </div>

      <Viewer className="PdfViewer" document="/light_pdf.pdf" />
    </div>
  );
};
