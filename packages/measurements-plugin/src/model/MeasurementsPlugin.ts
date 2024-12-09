import { PluginProps, EventBus } from "@pdf-viewer-toolkit/core";
import { FabricEditorPlugin } from "./FabricEditorPlugin";
import { ScaleTool } from "./ScaleTool";
import { Tool } from "./Tool";
import { AreaTool } from "./AreaTool";
import { UnitUpdatePayloadType } from "../config/types";
import { PluginEvents } from "../config/consts";
// TODO: use package or own implementation

type ToolType = "scale" | "area";

export class MeasurementsPlugin extends FabricEditorPlugin {
  private activeTool: ToolType | null;
  private activeToolInstance: Tool | null;
  private scaleTool: ScaleTool;
  private areaTool: AreaTool;
  private _eventBus: EventBus;
  private _unit: number;
  public pixelsPerUnit: number;

  constructor({ viewer }: PluginProps) {
    super({ viewer });
    this.activeTool = null;
    this.activeToolInstance = null;
    this._unit = 1;
    this.pixelsPerUnit = 1;
    this._eventBus = new EventBus();
    this._eventBus.on(PluginEvents.SetUnit, this.onUnitUpdate.bind(this));

    this.scaleTool = new ScaleTool({ editor: this });
    this.areaTool = new AreaTool({ editor: this });

    this.mountTool = this.mountTool.bind(this);
    this.enableTool = this.enableTool.bind(this);
    this.disableTool = this.disableTool.bind(this);

    // Enable editor layers
    this._toggleEditor();
  }

  public get unit() {
    return this._unit;
  }

  public get eventBus() {
    return this._eventBus;
  }

  public disableTool() {
    if (this.activeToolInstance) {
      this._editorEventBus.off("pagerender", this.mountTool);
      this._pageNumbers.forEach((pageNumber) =>
        this.activeToolInstance?.deactivate({ pageNumber })
      );
      this.activeToolInstance = null;
    }

    this.activeTool = null;
  }

  public enableTool(tool: ToolType | null) {
    this.disableTool();

    this.activeTool = tool;

    if (tool === "scale") {
      this.activeToolInstance = this.scaleTool;
      this._editorEventBus.on("pagerender", this.mountTool);
      this._pageNumbers.forEach((pageNumber) =>
        this.activeToolInstance?.activate({ pageNumber })
      );
    }

    if (tool === "area") {
      this.activeToolInstance = this.areaTool;
      this._editorEventBus.on("pagerender", this.mountTool);
      this._pageNumbers.forEach((pageNumber) =>
        this.activeToolInstance?.activate({ pageNumber })
      );
    }
  }

  private mountTool({ pageNumber }: { pageNumber: number }) {
    if (this.activeToolInstance) {
      this.activeToolInstance.activate({ pageNumber });
    }
  }

  private onUnitUpdate({ unit }: UnitUpdatePayloadType) {
    this._unit = unit;
  }
}
