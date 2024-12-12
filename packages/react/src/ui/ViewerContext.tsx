import { PDFViewer } from "@pdf-viewer-toolkit/core";
import React, { useEffect } from "react";

export interface ViewerContextType {
  viewer: PDFViewer | null;
  isLoaded: boolean;
  containerEl: React.RefObject<HTMLDivElement>;
  viewerEl: React.RefObject<HTMLDivElement>;
}

export const ViewerContext = React.createContext<ViewerContextType>({
  viewer: null,
  isLoaded: false,
  containerEl: null,
  viewerEl: null,
});

export const ViewerContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [viewer, setViewer] = React.useState<PDFViewer | null>(null);
  const viewerEl = React.useRef<HTMLDivElement>(null);
  const containerEl = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewer = new PDFViewer({
      // TODO: fix this
      container: containerEl.current,
      // TODO: fix this
      viewer: viewerEl.current,
    });

    setViewer(viewer);
    setIsLoaded(true);

    return () => {
      viewer.destroy();
    };
  }, []);

  return (
    <ViewerContext.Provider
      value={{
        viewer,
        isLoaded,
        containerEl,
        viewerEl,
      }}
    >
      {children}
    </ViewerContext.Provider>
  );
};
