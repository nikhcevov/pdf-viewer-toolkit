import { PDFViewer } from "@pdf-viewer-toolkit/core";
import { EditorPlugin } from "@pdf-viewer-toolkit/core";
import { MeasurementsPlugin } from "@pdf-viewer-toolkit/measurements-plugin";

const { viewer, setDocument, loadPlugin } = new PDFViewer({
  container: document.getElementById("pageContainer") as HTMLDivElement,
  viewer: document.getElementById("viewer") as HTMLDivElement,
});

const editorPlugin = new EditorPlugin({ viewer });
const measurementsPlugin = new MeasurementsPlugin({ viewer });
loadPlugin(editorPlugin);
loadPlugin(measurementsPlugin);

setDocument("essay.pdf").then(() => {
  const onPrevPage = () => {
    viewer.previousPage();
  };

  const onNextPage = () => {
    viewer.nextPage();
  };

  const onScaleMinus = () => {
    viewer.decreaseScale();
  };

  const onScalePlus = () => {
    viewer.increaseScale();
  };

  const onSetScaleToolClick = () => {
    measurementsPlugin.setActiveTool("scale");
    measurementsPlugin.onMeasure = (measurement) => {
      // Let's assume that we have measured a distance of 10 units
      const distance = 10;
      // We need to calculate how many pixels are in unit
      const pixelsPerUnit = measurement / distance;
      console.log(pixelsPerUnit);
    };
  };

  const onAreaToolClick = () => {
    measurementsPlugin.setActiveTool("area");
  };

  document.getElementById("prev")?.addEventListener("click", onPrevPage);
  document.getElementById("next")?.addEventListener("click", onNextPage);
  document.getElementById("scale_plus")?.addEventListener("click", onScalePlus);
  document
    .getElementById("scale_minus")
    ?.addEventListener("click", onScaleMinus);
  document
    .getElementById("set_scale_tool")
    ?.addEventListener("click", onSetScaleToolClick);
  document
    .getElementById("area_tool")
    ?.addEventListener("click", onAreaToolClick);
});
