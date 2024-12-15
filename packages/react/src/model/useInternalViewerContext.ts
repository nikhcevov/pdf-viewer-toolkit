import { useContext } from "react";
import { ViewerContext, ViewerContextType } from "../ui/ViewerContext";

type UseInternalViewerContextType = () => ViewerContextType;

export const useInternalViewerContext: UseInternalViewerContextType = () => {
  const context = useContext(ViewerContext);

  if (!context.isContextProviderExist) {
    throw new Error(
      "useViewerContext must be used within a ViewerContextProvider"
    );
  }

  return context;
};
