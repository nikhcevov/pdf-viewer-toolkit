import * as fabric from "fabric";
import { PDFPageView } from "pdfjs-dist/web/pdf_viewer.mjs";
import { EditorPlugin } from "../../../model/EditorPlugin";
import type { PluginProps } from "../../../model/Plugin";

export type OnMeasureCallbackType = (measurement: {
  lineDistance: number;
}) => void;

export class SetScaleTool extends EditorPlugin {
  private isActive: boolean;
  private canvasMap: Map<number, fabric.Canvas>;
  private onMeasureCallback: OnMeasureCallbackType;

  constructor({ viewer }: PluginProps) {
    super({ viewer });
    this.isActive = false;
    this.canvasMap = new Map();
    this.onMeasureCallback = () => {
      throw new Error("Method not implemented.");
    };
  }

  // TODO: Call method also on zoom change
  public set onMeasure(fn: OnMeasureCallbackType) {
    this.onMeasureCallback = fn;
  }

  public load(): void {
    super.load();
  }

  public unload(): void {
    super.unload();
    this.canvasMap.forEach((canvas) => {
      canvas.dispose();
    });
    this.canvasMap.clear();
    this.isActive = false;
    this.onMeasureCallback = () => {
      throw new Error("Method not implemented.");
    };
  }

  toggle = () => {
    if (this.isActive) {
      this._toggleEditor();
      this.isActive = false;
      return;
    }

    this._toggleEditor();
    this.isActive = true;
    this._pages.forEach(this.setupPageEvents);
  };

  onScaleChanging = ({ scale }: { scale: number }) => {
    // this.onScaleChanging({ scale });
    console.log("---1", scale);
    this._pages.forEach((page) => {
      console.log("---2", page.id);
      if (page.canvas) {
        const fabricCanvas = this.canvasMap.get(page.id);
        if (fabricCanvas) {
          console.log("---3", fabricCanvas);
          // fabricCanvas.setZoom(scale);
          fabricCanvas.setDimensions({
            height: page.canvas.height,
            width: page.canvas.width,
          });
          // fabricCanvas.renderAll();
        }
      }
    });
  };

  setupPageEvents = (page: PDFPageView) => {
    const canvasEl = this._getPageCanvas(page);
    const canvas = new fabric.Canvas(canvasEl);
    canvas.setZoom(this._zoom);
    this.canvasMap.set(page.id, canvas);

    let startPoint: fabric.Circle | null = null;
    let endPoint: fabric.Circle | null = null;
    let line: fabric.Line | null = null;

    canvas.on("mouse:down", (event) => {
      const pointer = canvas.getScenePoint(event.e);
      const clickX = pointer.x;
      const clickY = pointer.y;

      // reset points
      if (startPoint && endPoint && line) {
        canvas.remove(startPoint);
        canvas.remove(endPoint);
        canvas.remove(line);
        canvas.requestRenderAll();
        startPoint = null;
        endPoint = null;
        line = null;
      }

      if (!startPoint) {
        startPoint = new fabric.Circle({
          radius: 5,
          fill: "blue",
          left: clickX,
          top: clickY,
          selectable: false,
          originX: "center",
          originY: "center",
          hoverCursor: "auto",
        });

        canvas.add(startPoint);
        return;
      }

      line = new fabric.Line(
        [startPoint.left, startPoint.top, clickX, clickY],
        {
          stroke: "blue",
          strokeWidth: 4,
          hasControls: false,
          hasBorders: false,
          selectable: false,
          lockMovementX: true,
          lockMovementY: true,
          hoverCursor: "default",
          originX: "center",
          originY: "center",
        }
      );

      endPoint = new fabric.Circle({
        radius: 5,
        fill: "blue",
        left: clickX,
        top: clickY,
        selectable: false,
        originX: "center",
        originY: "center",
        hoverCursor: "auto",
      });

      canvas.add(endPoint);
      canvas.add(line);

      const a = startPoint.getX() - endPoint.getX();
      const b = startPoint.getY() - endPoint.getY();
      const lineDistance = Math.sqrt(a * a + b * b);

      this.onMeasureCallback({ lineDistance });
    });

    canvas.renderAll();
  };
}
