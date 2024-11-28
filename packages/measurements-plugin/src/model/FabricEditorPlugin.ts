import * as fabric from "fabric";
import { EditorPlugin, PluginProps } from "@pdf-viewer-toolkit/core";

export class FabricEditorPlugin extends EditorPlugin {
  constructor({ viewer }: PluginProps) {
    super({ viewer });

    this._editorEventBus.on("pagerender", this.onFabricPageRender);
    this._editorEventBus.on("pagereset", () => undefined);
    this._toggleEditor = this._toggleEditor.bind(this);
  }

  public unload(): void {
    this._editorEventBus.off("pagerender", this.onFabricPageRender);
  }

  private onFabricPageRender = ({ pageNumber }: { pageNumber: number }) => {
    const page = this._getPageByNumber(pageNumber);
    if (!page) {
      return;
    }

    const canvasEl = this._getPageCanvas(page);
    // TODO: Implement Set or Map to store fabric canvases
    // then check here if fabric canvas exists
    const canvas = new fabric.Canvas(canvasEl);
    canvas.setZoom(this._zoom);

    canvas.setDimensions({
      height: canvasEl.height,
      width: canvasEl.width,
    });
  };

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
