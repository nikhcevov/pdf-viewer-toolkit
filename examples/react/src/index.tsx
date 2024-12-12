import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { ViewerContextProvider } from "@pdf-viewer-toolkit/react";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ViewerContextProvider>
      <App />
    </ViewerContextProvider>
  </React.StrictMode>
);
