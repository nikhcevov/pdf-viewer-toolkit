import * as fabric from "fabric";
import { EditorPlugin, PluginProps } from "@pdf-viewer-toolkit/core";
import { SERIALIZABLE_PROPERTIES } from "../config/consts";

export class FabricEditorPlugin extends EditorPlugin {
  private _fabricCanvasMap: Map<number, fabric.Canvas>;
  private _fabricCanvasStorage: Map<number, string>;

  constructor({ viewer }: PluginProps) {
    super({ viewer });
    this._editorEventBus.on("pagerender", this.onFabricPageRender);
    this._editorEventBus.on("pagereset", this.onPageReset);
    this._toggleEditor = this._toggleEditor.bind(this);
    this._fabricCanvasMap = new Map();
    this._fabricCanvasStorage = new Map();
  }

  public get canvasMap() {
    return this._fabricCanvasMap;
  }

  private onPageReset = ({ pageNumber }: { pageNumber: number }) => {
    this._fabricCanvasMap.delete(pageNumber);
  };

  private onFabricPageRender = ({ pageNumber }: { pageNumber: number }) => {
    const page = this._getPageByNumber(pageNumber);
    if (!page) {
      // TODO: Add error handling
      return;
    }

    const editorCanvas = this._getPageEditorCanvas(pageNumber);
    const fabricCanvas = new fabric.Canvas(editorCanvas);

    const fabricCanvasStorage = this._fabricCanvasStorage.get(pageNumber);
    if (fabricCanvasStorage) {
      fabricCanvas
        .loadFromJSON(fabricCanvasStorage)
        .then((canvas) => canvas.requestRenderAll());
    }

    const fabricCanvasWrapper =
      editorCanvas.parentNode as HTMLDivElement | null;
    if (fabricCanvasWrapper) {
      fabricCanvasWrapper.style.position = "absolute";
      fabricCanvasWrapper.style.inset = "0";
      fabricCanvasWrapper.style.width = "100%";
      fabricCanvasWrapper.style.height = "100%";
    }

    const pageCanvas = page.canvas;
    if (pageCanvas) {
      fabricCanvas.setDimensions({
        height: pageCanvas.clientHeight,
        width: pageCanvas.clientWidth,
      });
    }

    this._fabricCanvasMap.set(page.id, fabricCanvas);
  };

  public serializeCanvas(pageNumber: number) {
    const fabricCanvas = this._fabricCanvasMap.get(pageNumber);
    if (!fabricCanvas) {
      return;
    }

    const serializedCanvas = fabricCanvas.toObject(SERIALIZABLE_PROPERTIES);
    this._fabricCanvasStorage.set(pageNumber, serializedCanvas);
  }

  public _toggleEditor() {
    super._toggleEditor();

    if (this.isEditorEnabled) {
      this._pages.forEach((page) => {
        this.onFabricPageRender({ pageNumber: page.id });
      });
    } else {
      console.log("off fabric");
    }
  }
}
