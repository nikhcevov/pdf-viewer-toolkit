import * as fabric from "fabric";
import { findSimilarFabricObject } from "./findSimilarFabricObject";

/**
 * Removes canvas objects from the canvas with custom comparison
 * @param canvas Fabric canvas
 * @param objects Fabric objects to remove
 */
export function removeCanvasObjects(
  canvas: fabric.Canvas,
  objects: fabric.Object[]
) {
  objects.forEach((obj) => {
    const foundObj = findSimilarFabricObject(canvas, obj);
    if (foundObj) {
      canvas.remove(foundObj);
    }
  });
}
