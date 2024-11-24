import { PDFViewer } from "@pdf-viewer-toolkit/core";

const { viewer, setDocument } = new PDFViewer({
  container: document.getElementById("pageContainer") as HTMLDivElement,
  viewer: document.getElementById("viewer") as HTMLDivElement,
})

setDocument("heavy_pdf.pdf").then(() => {
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
    viewer.increaseScale()
  };

  document.getElementById("prev")?.addEventListener("click", onPrevPage);
  document.getElementById("next")?.addEventListener("click", onNextPage);
  document.getElementById("scale_plus")?.addEventListener("click", onScalePlus);
  document.getElementById("scale_minus")?.addEventListener("click", onScaleMinus);
})

