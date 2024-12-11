import * as fabric from "fabric";
import {
  EditorPlugin,
  PageRenderEvent,
  PluginProps,
} from "@pdf-viewer-toolkit/core";
import { CanvasStorage } from "./CanvasStorage";
import { updateCanvasObjectDimensions } from "../lib/updateCanvasObjectDimensions";

export class FabricEditorPlugin extends EditorPlugin {
  private _fabricCanvasMap: Map<number, fabric.Canvas>;
  private _fabricCanvasStorage: CanvasStorage;

  constructor({ viewer }: PluginProps) {
    super({ viewer });
    this._editorEventBus.on("pagerender", this.onFabricPageRender);
    this._editorEventBus.on("pagereset", this.onPageReset);
    this._toggleEditor = this._toggleEditor.bind(this);
    this._fabricCanvasMap = new Map();
    this._fabricCanvasStorage = new CanvasStorage();
  }

  public get canvasMap() {
    return this._fabricCanvasMap;
  }

  private onPageReset = ({ pageNumber }: { pageNumber: number }) => {
    this._fabricCanvasMap.delete(pageNumber);
  };

  private onFabricPageRender = async ({
    pageNumber,
    height,
    width,
  }: PageRenderEvent) => {
    const editorCanvas = this._getPageEditorCanvas(pageNumber);
    const fabricCanvas = new fabric.Canvas(editorCanvas);
    fabricCanvas.setDimensions({ height: height, width: width });

    const fabricCanvasStorage = this._fabricCanvasStorage.get(pageNumber);
    if (fabricCanvasStorage) {
      await this._fabricCanvasStorage.deserialize(pageNumber, fabricCanvas);

      // adjust object positions on canvas
      updateCanvasObjectDimensions(
        fabricCanvas,
        fabricCanvasStorage?.height,
        fabricCanvasStorage?.width
      );
      // To store updated object positions
      this._fabricCanvasStorage.serialize(pageNumber, fabricCanvas);
    }

    const fabricCanvasWrapper =
      editorCanvas.parentNode as HTMLDivElement | null;
    if (fabricCanvasWrapper) {
      fabricCanvasWrapper.style.position = "absolute";
      fabricCanvasWrapper.style.inset = "0";
      fabricCanvasWrapper.style.width = "100%";
      fabricCanvasWrapper.style.height = "100%";
    }

    this._fabricCanvasMap.set(pageNumber, fabricCanvas);
  };

  public serializeCanvas(pageNumber: number) {
    const fabricCanvas = this._fabricCanvasMap.get(pageNumber);
    if (!fabricCanvas) {
      return;
    }

    this._fabricCanvasStorage.serialize(pageNumber, fabricCanvas);
  }

  public _toggleEditor() {
    super._toggleEditor();

    if (this.isEditorEnabled) {
      this._pages.forEach((page) => {
        this.onFabricPageRender({
          pageNumber: page.id,
          height: page.height,
          width: page.width,
        });
      });
    } else {
      // TODO
      console.log("off fabric");
    }
  }
}
