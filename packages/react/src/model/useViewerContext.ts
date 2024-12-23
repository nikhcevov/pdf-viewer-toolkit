import { useContext } from "react";
import { ViewerContext, ViewerContextType } from "../ui/ViewerContext";

type UseViewerContextType = () => {
  viewer: ViewerContextType["viewer"];
};

export const useViewerContext: UseViewerContextType = () => {
  const context = useContext(ViewerContext);

  if (!context.isContextProviderExist) {
    throw new Error(
      "useViewerContext must be used within a ViewerContextProvider"
    );
  }

  return { viewer: context.viewer };
};
