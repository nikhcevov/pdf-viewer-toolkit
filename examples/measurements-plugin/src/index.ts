import { PDFViewer } from "@pdf-viewer-toolkit/core";
import {
  MeasurementsPlugin,
  PluginEvents,
} from "@pdf-viewer-toolkit/measurements-plugin";

const { viewer, setDocument, loadPlugin } = new PDFViewer({
  container: document.getElementById("pageContainer") as HTMLDivElement,
  viewer: document.getElementById("viewer") as HTMLDivElement,
});

const measurementsPlugin = new MeasurementsPlugin({ viewer });
loadPlugin(measurementsPlugin);

setDocument("light_pdf.pdf").then(() => {
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
    measurementsPlugin.enableTool("scale");
  };

  const onAreaToolClick = () => {
    measurementsPlugin.enableTool("area");
  };

  // const onScaleChange: OnScaleChangeType = ({ measurement }) => {
  //   // Let's assume that we have measured a distance of 10 units
  //   const distance = 10;
  //   // We need to calculate how many pixels are in unit
  //   const measurementRatio = measurement / distance;
  //   console.log(measurementRatio, measurement, distance);
  //   measurementsPlugin.eventBus.dispatch(PluginEvents.SetUnit, {
  //     unit: measurementRatio,
  //   });
  // };
  // measurementsPlugin.eventBus.on(PluginEvents.ChangeScale, onScaleChange);
  document
    .getElementById("scale_input")
    ?.addEventListener("change", (event) => {
      const unit = (event?.target as HTMLInputElement).value;
      measurementsPlugin.eventBus.dispatch(PluginEvents.SetUnit, {
        unit: unit,
      });
    });

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
