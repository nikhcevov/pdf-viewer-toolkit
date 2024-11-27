import * as fabric from "fabric";

import { EditorPlugin } from "../../../model/EditorPlugin";
import { MeasurementsPluginTools } from "../config/types";

import type { PluginProps } from "../../../model/Plugin";

export class MeasurementsPlugin extends EditorPlugin {
  private activeTool: MeasurementsPluginTools | null = null;

  constructor({ viewer }: PluginProps) {
    super({ viewer });
    this.activeTool = null;
  }

  public load(): void {
    super.load();
  }

  public unload(): void {
    super.unload();
  }

  // TODO: Add other tools, change active tool properly
  toggleTool = (tool: MeasurementsPluginTools) => {
    if (tool === MeasurementsPluginTools.SET_SCALE) {
      this.toggleSetScaleTool();
      return;
    }

    if (tool === MeasurementsPluginTools.AREA) {
      this.toggleAreaTool();
      return;
    }

    // if (tool === MeasurementsPluginTools.COUNTER) {
    //   this.toggleCounterTool();
    //   return;
    // }
  };

  toggleAreaTool = () => {
    const isAreaToolActive = this.activeTool === MeasurementsPluginTools.AREA;

    if (isAreaToolActive) {
      this._toggleEditor();
      this.activeTool = null;
      return;
    }

    this.activeTool = MeasurementsPluginTools.AREA;
    this._toggleEditor();

    this._pages.forEach((page) => {
      const canvasEl = this._getPageCanvas(page);
      const canvas = new fabric.Canvas(canvasEl);

      const pipePoints: fabric.Circle[] = [];
      const pipeLines: fabric.Line[] = [];
      let isDrawing = true;

      canvas.on("mouse:down", function (event) {
        if (!isDrawing) {
          return;
        }

        const pointer = canvas.getPointer(event.e);
        const positionX = pointer.x;
        const positionY = pointer.y;

        // Check if the user clicked near the initial point, to finish area
        if (pipePoints.length > 2) {
          const initialPoint = pipePoints[0];

          const isClickedNearInitialPoint =
            Math.abs(positionX - initialPoint.get("left")) < 10 &&
            Math.abs(positionY - initialPoint.get("top")) < 10;

          if (isClickedNearInitialPoint) {
            const points = pipePoints.map((point) => ({
              x: point.get("left"),
              y: point.get("top"),
            }));

            const poly = new fabric.Polygon(points, {
              fill: "yellow",
              strokeWidth: 1,
              stroke: "grey",
              objectCaching: false,
              transparentCorners: false,
              cornerColor: "blue",
              cornerStyle: "circle",
              hasBorders: false,
            });

            poly.cornerColor = "rgba(0,0,255,0.5)";
            poly.controls = fabric.controlsUtils.createPolyControls(poly);

            canvas.remove(...pipePoints, ...pipeLines);
            canvas.add(poly);

            isDrawing = false;
            return;
          }
        }

        const circlePoint = new fabric.Circle({
          radius: 5,
          fill: "blue",
          left: positionX,
          top: positionY,
          selectable: false,
          originX: "center",
          originY: "center",
          hoverCursor: "auto",
        });

        canvas.add(circlePoint);
        pipePoints.push(circlePoint);

        if (pipePoints.length > 1) {
          // Just draw a line using the last two points, so we don't need to clear
          // and re-render all the lines
          const prevPoint = pipePoints[pipePoints.length - 2];
          const currentPoint = pipePoints[pipePoints.length - 1];

          const waterLine = new fabric.Line(
            [
              prevPoint.get("left"),
              prevPoint.get("top"),
              currentPoint.get("left"),
              currentPoint.get("top"),
            ],
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

          pipeLines.push(waterLine);
          canvas.add(waterLine);
        }
      });

      canvas.renderAll();
    });
  };

  toggleSetScaleTool = () => {
    const isSetScaleToolActive =
      this.activeTool === MeasurementsPluginTools.SET_SCALE;

    if (isSetScaleToolActive) {
      this._toggleEditor();
      this.activeTool = null;
      return;
    }

    this.activeTool = MeasurementsPluginTools.SET_SCALE;
    this._toggleEditor();

    this._pages.forEach((page) => {
      const canvasEl = this._getPageCanvas(page);
      const canvas = new fabric.Canvas(canvasEl);

      let pointLeft: number | null = null;
      let pointTop: number | null = null;

      canvas.on("mouse:down", (event) => {
        const pointer = canvas.getPointer(event.e);
        const clickX = pointer.x;
        const clickY = pointer.y;

        if (!pointLeft || !pointTop) {
          const startPoint = new fabric.Circle({
            radius: 5,
            fill: "blue",
            left: clickX,
            top: clickY,
            selectable: false,
            originX: "center",
            originY: "center",
            hoverCursor: "auto",
          });

          pointLeft = clickX;
          pointTop = clickY;
          canvas.add(startPoint);
          return;
        }

        const line = new fabric.Line([pointLeft, pointTop, clickX, clickY], {
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
        });

        const endPoint = new fabric.Circle({
          radius: 5,
          fill: "blue",
          left: clickX,
          top: clickY,
          selectable: false,
          originX: "center",
          originY: "center",
          hoverCursor: "auto",
        });

        pointLeft = null;
        pointTop = null;
        canvas.add(endPoint);
        canvas.add(line);
      });

      canvas.renderAll();
    });
  };
}
