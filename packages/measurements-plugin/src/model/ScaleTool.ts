import { calculatePointsDistance } from "../lib/calculatePointsDistance";
import { MeasurementsPlugin } from "./MeasurementsPlugin";
import { Tool } from "./Tool";
import * as fabric from "fabric";

const findSimilarObject = (canvas: fabric.Canvas, object: fabric.Object) => {
  const objects = canvas.getObjects();
  return objects.find(
    (obj) =>
      obj.left === object.left &&
      obj.top === object.top &&
      obj.type === object.type
  );
};

export class ScaleTool extends Tool {
  // Only one line is allowed for document with multiple pages
  // So we need to keep track of line and points as class wide properties
  private line: fabric.Line | null;
  private startPoint: fabric.Circle | null;
  private endPoint: fabric.Circle | null;
  private lastPageNumber: number | null;
  private disposersMap: Map<number, () => void>;

  constructor({ editor }: { editor: MeasurementsPlugin }) {
    super({ editor });
    this.line = null;
    this.startPoint = null;
    this.endPoint = null;
    this.lastPageNumber = null;
    this.disposersMap = new Map();
    this.clearPrevPage.bind(this);
    this.activate.bind(this);
    this.deactivate.bind(this);
  }

  public activate({ pageNumber }: { pageNumber: number }): void {
    setTimeout(() => {
      const canvas = this.editor.canvasMap.get(pageNumber);

      if (!canvas) {
        // TODO: Add error handling
        return;
      }

      const dispose = canvas.on("mouse:down", (event) =>
        this.onMouseDown(event, canvas, pageNumber)
      );
      this.disposersMap.set(pageNumber, dispose);
    }, 10);
  }

  private onMouseDown = (
    event: fabric.TPointerEventInfo<fabric.TPointerEvent>,
    canvas: fabric.Canvas,
    pageNumber: number
  ) => {
    if (this.lastPageNumber && this.lastPageNumber !== pageNumber) {
      this.clearPrevPage(this.lastPageNumber);
    }

    this.lastPageNumber = pageNumber;
    const pointer = canvas.getScenePoint(event.e);
    const clickX = pointer.x;
    const clickY = pointer.y;

    // reset points
    if (this.startPoint && this.endPoint && this.line) {
      // There is a bug in fabric.js that it doesn't remove objects after page rerender
      // So we need to find similar objects and remove them with custom matcher
      const startPoint = findSimilarObject(canvas, this.startPoint);
      if (startPoint) {
        canvas.remove(startPoint);
        this.startPoint = null;
      }
      const endPoint = findSimilarObject(canvas, this.endPoint);
      if (endPoint) {
        canvas.remove(endPoint);
        this.endPoint = null;
      }
      const line = findSimilarObject(canvas, this.line);
      if (line) {
        canvas.remove(line);
        this.line = null;
      }
    }

    if (!this.startPoint) {
      this.startPoint = new fabric.Circle({
        radius: 5,
        fill: "blue",
        left: clickX,
        top: clickY,
        selectable: false,
        originX: "center",
        originY: "center",
        hoverCursor: "auto",
      });
      canvas.add(this.startPoint);
      this.editor.serializeCanvas(pageNumber);
      return;
    }

    this.line = new fabric.Line(
      [this.startPoint.left, this.startPoint.top, clickX, clickY],
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

    this.endPoint = new fabric.Circle({
      radius: 5,
      fill: "blue",
      left: clickX,
      top: clickY,
      selectable: false,
      originX: "center",
      originY: "center",
      hoverCursor: "auto",
    });

    canvas.add(this.endPoint);
    canvas.add(this.line);
    this.editor.serializeCanvas(pageNumber);

    const lineDistance = calculatePointsDistance(
      { x: this.startPoint.getX(), y: this.startPoint.getY() },
      { x: this.endPoint.getX(), y: this.endPoint.getY() }
    );

    this.editor._onMeasureCallback(lineDistance);
  };

  private clearPrevPage(pageNumber: number) {
    const canvas = this.editor.canvasMap.get(pageNumber);
    if (!canvas) {
      this.startPoint = null;
      this.endPoint = null;
      this.line = null;
      return;
    }
    if (this.startPoint) {
      const startPoint = findSimilarObject(canvas, this.startPoint);
      if (startPoint) {
        canvas.remove(startPoint);
        this.startPoint = null;
      }
    }
    if (this.endPoint) {
      const endPoint = findSimilarObject(canvas, this.endPoint);
      if (endPoint) {
        canvas.remove(endPoint);
        this.endPoint = null;
      }
    }
    if (this.line) {
      const line = findSimilarObject(canvas, this.line);
      if (line) {
        canvas.remove(line);
        this.line = null;
      }
    }
    this.editor.serializeCanvas(pageNumber);
  }

  /**
   * Clears state if deactivated page is unfinished (start point, but no end point nor line)
   */
  private clearUnfinishedPage(pageNumber: number) {
    const canvas = this.editor.canvasMap.get(pageNumber);
    if (!canvas) {
      return;
    }
    if (
      this.startPoint &&
      (!this.endPoint || !this.line) &&
      canvas.contains(this.startPoint)
    ) {
      canvas.remove(this.startPoint);
      this.startPoint = null;
    }
  }

  public deactivate({ pageNumber }: { pageNumber: number }): void {
    this.clearUnfinishedPage(pageNumber);
    if (this.disposersMap.has(pageNumber)) {
      this.disposersMap.get(pageNumber)?.();
      this.disposersMap.delete(pageNumber);
    }
  }
}
