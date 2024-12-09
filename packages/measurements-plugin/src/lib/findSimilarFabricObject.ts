import * as fabric from "fabric";

const round = (num: number, decimals: number) => {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
};

/**
 * Finds similar fabric object in the canvas, method is used as a workaround for
 * fabric.js isEqual method, which doesn't work if canvas is rerendered
 *
 * TODO: Check if there is enough strictness in the comparison
 *
 * @param canvas The fabric canvas
 * @param object The fabric object to find similar object for
 * @returns Fabric object if found, undefined otherwise
 */
export function findSimilarFabricObject(
  canvas: fabric.Canvas,
  object: fabric.Object
) {
  const objects = canvas.getObjects();
  return objects.find(
    (obj) =>
      round(obj.left, 3) === round(object.left, 3) &&
      round(obj.top, 3) === round(object.top, 3) &&
      obj.type === object.type
  );
}
