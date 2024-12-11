import * as fabric from "fabric";

const updateObjectDimensions = (
  object: fabric.Object,
  canvas: fabric.Canvas,
  prevHeight: number,
  prevWidth: number
) => {
  const currentHeight = canvas.height;
  const currentWidth = canvas.width;
  const heightRatio = currentHeight / prevHeight;
  const widthRatio = currentWidth / prevWidth;

  if (object.type === "group") {
    const group = object as fabric.Group;
    group.left = group.left * widthRatio;
    group.top = group.top * heightRatio;
    group.height = group.height * heightRatio;
    group.width = group.width * widthRatio;
    group.forEachObject((groupObject) => {
      updateObjectDimensions(groupObject, canvas, prevHeight, prevWidth);
    });
  }

  if (object.type === "circle") {
    const circle = object as fabric.Circle;
    circle.left = circle.left * widthRatio;
    circle.top = circle.top * heightRatio;
  }

  if (object.type === "line") {
    const line = object as fabric.Line;
    line.set({
      x1: line.x1 * widthRatio,
      y1: line.y1 * heightRatio,
      x2: line.x2 * widthRatio,
      y2: line.y2 * heightRatio,
      top: line.top * heightRatio,
      left: line.left * widthRatio,
    });
  }

  if (object.type === "polygon") {
    const polygon = object as fabric.Polygon;
    polygon.set({
      left: polygon.left * widthRatio,
      top: polygon.top * heightRatio,
      width: polygon.width * heightRatio,
      height: polygon.height * heightRatio,
      pathOffset: {
        x: polygon.pathOffset.x * widthRatio,
        y: polygon.pathOffset.y * heightRatio,
      },
      points: polygon.points.map((point) => ({
        x: point.x * widthRatio,
        y: point.y * heightRatio,
      })),
    });
  }
};

export const updateCanvasObjectDimensions = (
  canvas: fabric.Canvas,
  prevHeight: number,
  prevWidth: number
) => {
  canvas.forEachObject((object) => {
    updateObjectDimensions(object, canvas, prevHeight, prevWidth);
  });
};
