import { PluginProps } from "@pdf-viewer-toolkit/core";
import { FabricEditorPlugin } from "./FabricEditorPlugin";
import { ScaleTool } from "./ScaleTool";
import { Tool } from "./Tool";

type ToolType = "scale" | "area";

export class MeasurementsPlugin extends FabricEditorPlugin {
  private activeTool: ToolType | null;
  private activeToolInstance: Tool | null;
  private scaleTool: ScaleTool;
  private onMeasureCallback: (lineDistance: number) => void;

  constructor({ viewer }: PluginProps) {
    super({ viewer });
    this.activeTool = null;
    this.activeToolInstance = null;
    this.onMeasureCallback = () => undefined;
    this.scaleTool = new ScaleTool({ editor: this });

    // Enable editor layers
    this._toggleEditor();
  }

  setActiveTool(tool: ToolType | null) {
    if (this.activeToolInstance) {
      this._editorEventBus.off("pagerender", this.mountTool);
      this._pageNumbers.forEach((pageNumber) =>
        this.activeToolInstance?.deactivate({ pageNumber })
      );
      this.activeToolInstance = null;
    }

    this.activeTool = tool;

    if (tool === "scale") {
      this.activeToolInstance = this.scaleTool;
      this._editorEventBus.on("pagerender", this.mountTool);
      this._pageNumbers.forEach((pageNumber) =>
        this.activeToolInstance?.activate({ pageNumber })
      );
    }
  }

  public set onMeasure(callback: (lineDistance: number) => void) {
    this.onMeasureCallback = callback;
  }
  public get _onMeasureCallback() {
    return this.onMeasureCallback;
  }

  private mountTool = ({ pageNumber }: { pageNumber: number }) => {
    if (this.activeToolInstance) {
      this.activeToolInstance.activate({ pageNumber });
    }
  };
}
