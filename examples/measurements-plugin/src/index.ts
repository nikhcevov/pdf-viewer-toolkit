import { PDFViewer } from "@pdf-viewer-toolkit/core";
import { EditorPlugin } from "@pdf-viewer-toolkit/core";
import { SetScaleTool } from "@pdf-viewer-toolkit/measurements-plugin";

const { viewer, setDocument, loadPlugin } = new PDFViewer({
  container: document.getElementById("pageContainer") as HTMLDivElement,
  viewer: document.getElementById("viewer") as HTMLDivElement,
});

// const plugin = new MeasurementsPlugin({ viewer });
// const setScaleTool = new SetScaleTool({ viewer });
const editorPlugin = new EditorPlugin({ viewer });
const scaleTool = new SetScaleTool({ viewer });
// loadPlugin(plugin);
loadPlugin(editorPlugin);
loadPlugin(scaleTool);
// loadPlugin(setScaleTool);

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
    // api example
    // setScaleTool.toggle();
    // setScaleTool.onMeasure = (scale) => {
    //   console.log(measurement);
    // };
    //
    scaleTool._toggleEditor();

    // setScaleTool.toggle();
    // setScaleTool.onMeasure = (measurement) => {
    //   // Let's assume that we have measured a distance of 10 units
    //   const distance = 10;
    //   // We need to calculate how many pixels are in unit
    //   const pixelsPerUnit = measurement.lineDistance / distance;
    //   console.log(pixelsPerUnit);
    // };
    // setScaleTool.
    // plugin.onMeasure = (measurement) => {
    //   console.log(measurement);
    // };

    // plugin.toggleTool(MeasurementsPluginTools.SET_SCALE);
    // plugin.onScaleChange = (scale) => {
    //   measureScale = scale;
    // };
  };

  const onAreaToolClick = () => {
    // plugin.toggleTool(MeasurementsPluginTools.AREA);
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
