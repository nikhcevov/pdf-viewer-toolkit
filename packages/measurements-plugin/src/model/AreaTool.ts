import {
  LINE_CONFIG,
  CIRCLE_CONFIG,
  POLIGON_CONFIG,
  PluginEvents,
  GROUP_CONFIG,
} from "../config/consts";
import { addObjectDeleteButton } from "../lib/addObjectDeleteButton";
import { calculatePolygonArea } from "../lib/calculatePolygonArea";
import { findSimilarFabricObject } from "../lib/findSimilarFabricObject";
import { removeCanvasObjects } from "../lib/removeCanvasObjects";
import { MeasurementsPlugin } from "./MeasurementsPlugin";
import { Tool } from "./Tool";
import * as fabric from "fabric";

export class AreaTool extends Tool {
  private disposersMap: Map<number, () => void>;
  private lastPageNumber: number | null;
  private pipePoints: fabric.Circle[];
  private pipeLines: fabric.Line[];

  constructor({ editor }: { editor: MeasurementsPlugin }) {
    super({ editor });
    this.disposersMap = new Map();
    this.lastPageNumber = null;
    this.pipeLines = [];
    this.pipePoints = [];

    this.editor.eventBus.on(
      PluginEvents.SetUnit,
      this.renderMeasurement.bind(this)
    );
    this.editor.eventBus.on(
      PluginEvents.ChangeScale,
      this.renderMeasurement.bind(this)
    );
    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this.renderMeasurement = this.renderMeasurement.bind(this);
    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this.renderMeasurement = this.renderMeasurement.bind(this);
  }

  public renderMeasurement(): void {
    this.editor.canvasMap.forEach((canvas) => {
      if (!canvas) {
        // TODO: Add error handling
        return;
      }

      const areaGroups = canvas
        .getObjects()
        .filter((obj) => obj.creator === "areatool") as fabric.Group[];

      areaGroups.forEach((group) => {
        const [polygon, text] = group.getObjects() as [
          fabric.Polygon,
          fabric.FabricText
        ];

        const pixelArea = calculatePolygonArea(polygon.points);
        const area = pixelArea / Math.pow(this.editor.pixelsPerUnit, 2);
        text.set("text", String(area));
        canvas.renderAll();
      });
    });
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
    // Skip click on objects
    if (event.target?.creator === "areatool") {
      return;
    }

    if (this.lastPageNumber && this.lastPageNumber !== pageNumber) {
      this.clearPrevPage(this.lastPageNumber);
    }

    this.lastPageNumber = pageNumber;
    const pointer = canvas.getScenePoint(event.e);
    const positionX = pointer.x;
    const positionY = pointer.y;

    // Check if the user clicked near the initial point, to finish area
    if (this.pipePoints.length > 2) {
      const initialPoint = this.pipePoints[0];

      const isClickedNearInitialPoint =
        Math.abs(positionX - initialPoint.get("left")) < 10 &&
        Math.abs(positionY - initialPoint.get("top")) < 10;

      if (isClickedNearInitialPoint) {
        const points = this.pipePoints.map((point) => ({
          x: point.get("left"),
          y: point.get("top"),
        }));

        const poly = new fabric.Polygon(points, POLIGON_CONFIG);
        // TODO: Add resize controls for polygon
        // poly.controls = fabric.controlsUtils.createPolyControls(poly);
        const polygonCenter = poly.getCenterPoint();
        const text = new fabric.FabricText("", {
          left: polygonCenter.x,
          top: polygonCenter.y,
        });
        const group = new fabric.Group([poly, text], GROUP_CONFIG);
        group.creator = "areatool";
        group.canvas = canvas;
        addObjectDeleteButton(group)

        removeCanvasObjects(canvas, [...this.pipePoints, ...this.pipeLines]);
        this.pipeLines = [];
        this.pipePoints = [];
        canvas.add(group);
        this.renderMeasurement();
        this.editor.serializeCanvas(pageNumber);
        return;
      }
    }

    const circlePoint = new fabric.Circle({
      left: positionX,
      top: positionY,
      ...CIRCLE_CONFIG,
    });
    canvas.add(circlePoint);
    this.pipePoints.push(circlePoint);

    if (this.pipePoints.length > 1) {
      // Just draw a line using the last two points, so we don't need to clear
      // and re-render all the lines
      const prevPoint = this.pipePoints[this.pipePoints.length - 2];
      const currentPoint = this.pipePoints[this.pipePoints.length - 1];

      const newLine = new fabric.Line(
        [
          prevPoint.get("left"),
          prevPoint.get("top"),
          currentPoint.get("left"),
          currentPoint.get("top"),
        ],
        LINE_CONFIG
      );

      this.pipeLines.push(newLine);
      canvas.add(newLine);
    }

    this.editor.serializeCanvas(pageNumber);
  };

  private clearPrevPage(pageNumber: number) {
    const canvas = this.editor.canvasMap.get(pageNumber);
    if (!canvas) {
      return;
    }

    this.pipeLines.forEach((line) => {
      const foundLine = findSimilarFabricObject(canvas, line);
      if (foundLine) {
        canvas.remove(foundLine);
        this.pipeLines = this.pipeLines.filter((l) => l !== line);
      }
    });

    this.pipePoints.forEach((point) => {
      const foundPoint = findSimilarFabricObject(canvas, point);
      if (foundPoint) {
        canvas.remove(foundPoint);
        this.pipePoints = this.pipePoints.filter((p) => p !== point);
      }
    });

    this.editor.serializeCanvas(pageNumber);
  }

  public deactivate({ pageNumber }: { pageNumber: number }): void {
    this.clearPrevPage(pageNumber);
    if (this.disposersMap.has(pageNumber)) {
      this.disposersMap.get(pageNumber)?.();
      this.disposersMap.delete(pageNumber);
    }
  }
}
