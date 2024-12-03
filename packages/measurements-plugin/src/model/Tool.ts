import { MeasurementsPlugin } from "./MeasurementsPlugin";

export class Tool {
  public editor: MeasurementsPlugin;

  constructor({ editor }: { editor: MeasurementsPlugin }) {
    this.editor = editor;
  }

  public activate({ pageNumber }: { pageNumber: number }) {
    console.log("activate", pageNumber);
  }

  public deactivate({ pageNumber }: { pageNumber: number }) {
    console.log("deactivate", pageNumber);
  }
}
