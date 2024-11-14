import { PDFViewer } from "@pdf-viewer-toolkit/core";

const viewer = new PDFViewer({
  url: "light_pdf.pdf",
  canvas: document.getElementById("the-canvas") as HTMLCanvasElement,
});

async function main() {
  await viewer.init();

  const drawPageNumber = () => {
    document.getElementById("page_num")!.textContent =
      viewer.currentPage.toString();
  };

  const onPrevPage = () => {
    if (viewer.currentPage === 1) {
      return;
    }
    viewer.renderPage(viewer.currentPage - 1);
    drawPageNumber();
  };

  const onNextPage = () => {
    if (viewer.currentPage === viewer.pageCount) {
      return;
    }
    viewer.renderPage(viewer.currentPage + 1);
    drawPageNumber();
  };

  drawPageNumber();
  document.getElementById("page_count")!.textContent = viewer.pageCount.toString();
  document.getElementById("prev")?.addEventListener("click", onPrevPage);
  document.getElementById("next")?.addEventListener("click", onNextPage);
}

main();
