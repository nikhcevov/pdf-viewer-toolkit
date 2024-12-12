import { useContext } from "react";
import { ViewerContext, ViewerContextType } from "../ui/ViewerContext";

type UseViewerContextType = () => ViewerContextType;

export const useViewerContext: UseViewerContextType = () => {
  const context = useContext(ViewerContext);

  if (!context) {
    throw new Error(
      "useViewerContext must be used within a ViewerContextProvider"
    );
  }

  return context;
};
