import { PDFViewer } from "@pdf-viewer-toolkit/core";
import React, {
  FC,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";

export interface ViewerContextType {
  viewer: PDFViewer | null;
  isLoaded: boolean;
  containerEl: React.RefObject<HTMLDivElement | null>;
  viewerEl: React.RefObject<HTMLDivElement | null>;
  isContextProviderExist: boolean;
}

export const ViewerContext = React.createContext<ViewerContextType>({
  viewer: null,
  isLoaded: false,
  containerEl: { current: null },
  viewerEl: { current: null },
  isContextProviderExist: false,
});

export const ViewerContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [viewer, setViewer] = useState<PDFViewer | null>(null);
  const viewerEl = useRef<HTMLDivElement>(null);
  const containerEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewerEl.current || !containerEl.current) {
      throw new Error(
        "ViewerContextProvider must be used with a Viewer component"
      );
    }

    const viewer = new PDFViewer({
      container: containerEl.current,
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
        isContextProviderExist: true,
      }}
    >
      {children}
    </ViewerContext.Provider>
  );
};
