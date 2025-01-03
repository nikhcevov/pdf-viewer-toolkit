import {
  CIRCLE_CONFIG,
  PluginEvents,
  LINE_CONFIG,
  GROUP_CONFIG,
} from "../config/consts";
import { addObjectDeleteButton } from "../lib/addObjectDeleteButton";
import { calculatePointsDistance } from "../lib/calculatePointsDistance";
import { findSimilarFabricObject } from "../lib/findSimilarFabricObject";
import { MeasurementsPlugin } from "./MeasurementsPlugin";
import { Tool } from "./Tool";
import * as fabric from "fabric";

export class ScaleTool extends Tool {
  // Only one line is allowed for document with multiple pages
  // So we need to keep track of line and points as class wide properties
  private group: fabric.Group | null;
  private lastPageNumber: number | null;
  private disposersMap: Map<number, () => void>;

  constructor({ editor }: { editor: MeasurementsPlugin }) {
    super({ editor });
    this.group = null;
    this.lastPageNumber = null;
    this.disposersMap = new Map();
    this.clearPage.bind(this);
    this.activate.bind(this);
    this.deactivate.bind(this);
    this.editor.eventBus.on(
      PluginEvents.SetUnit,
      this.renderMeasurement.bind(this)
    );
  }

  public renderMeasurement(): void {
    this.editor.canvasMap.forEach((canvas) => {
      if (!canvas) {
        // TODO: Add error handling
        return;
      }

      const scaleToolGroup = canvas
        .getObjects()
        .filter((obj) => obj.creator === "scaletool") as fabric.Group[];

      scaleToolGroup.forEach((group) => {
        const [startPoint, endPoint, , text] = group.getObjects();

        const lengthInPixels = calculatePointsDistance(
          { x: startPoint.getX(), y: startPoint.getY() },
          { x: endPoint.getX(), y: endPoint.getY() }
        );
        const pixelsPerUnit = lengthInPixels / this.editor.unit;
        text.set("text", String(this.editor.unit));
        this.editor.pixelsPerUnit = pixelsPerUnit;
        canvas.renderAll();
      });
    });
  }

  private get isGroupFinished() {
    return this.group?.getObjects().length === 4;
  }

  public activate({ pageNumber }: { pageNumber: number }): void {
    const canvas = this.editor.canvasMap.get(pageNumber);

    if (!canvas) {
      // TODO: Add error handling
      return;
    }

    const dispose = canvas.on("mouse:down", (event) =>
      this.onMouseDown(event, canvas, pageNumber)
    );
    this.disposersMap.set(pageNumber, dispose);
  }

  private onMouseDown = (
    event: fabric.TPointerEventInfo<fabric.TPointerEvent>,
    canvas: fabric.Canvas,
    pageNumber: number
  ) => {
    if (this.lastPageNumber && this.lastPageNumber !== pageNumber) {
      this.clearPage(this.lastPageNumber);
    }

    this.lastPageNumber = pageNumber;
    const pointer = canvas.getScenePoint(event.e);
    const clickX = pointer.x;
    const clickY = pointer.y;

    // reset group
    if (this.isGroupFinished) {
      this.clearPage(pageNumber);
    }

    // Draw start point only
    if (!this.group) {
      const newStartPoint = new fabric.Circle({
        left: clickX,
        top: clickY,
        ...CIRCLE_CONFIG,
      });
      const group = new fabric.Group([newStartPoint], GROUP_CONFIG);
      const onGroupDelete = () => {
        this.group = null;
      }
      addObjectDeleteButton(group, onGroupDelete)
      group.creator = "scaletool";
      canvas.add(group);
      this.group = group;
      this.editor.serializeCanvas(pageNumber);
      return;
    }

    const startPoint = this.group.item(0);
    const line = new fabric.Line(
      [startPoint.getX(), startPoint.getY(), clickX, clickY],
      LINE_CONFIG
    );

    const endPoint = new fabric.Circle({
      left: clickX,
      top: clickY,
      ...CIRCLE_CONFIG,
    });

    const lineCenter = line.getCenterPoint();
    const text = new fabric.FabricText("", {
      left: lineCenter.x,
      top: lineCenter.y,
    });
    this.group?.add(endPoint, line, text);
    this.renderMeasurement();
    this.editor.serializeCanvas(pageNumber);

    // const measurement = calculatePointsDistance(
    //   { x: startPoint.getX(), y: startPoint.getY() },
    //   { x: endPoint.getX(), y: endPoint.getY() }
    // );

    this.editor.eventBus.dispatch(PluginEvents.ChangeScale, {});
    this.editor.disableTool();
  };

  private clearPage(pageNumber: number) {
    const canvas = this.editor.canvasMap.get(pageNumber);
    if (!canvas) {
      this.group = null;
      return;
    }
    if (this.group) {
      const group = findSimilarFabricObject(canvas, this.group);
      if (group) {
        canvas.remove(group);
        this.group = null;
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
      this.group &&
      this.group.getObjects().length === 1 &&
      canvas.contains(this.group)
    ) {
      canvas.remove(this.group);
      this.group = null;
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
