import { SERIALIZABLE_PROPERTIES } from "../config/consts";
import * as fabric from "fabric";

interface CanvasEntry {
  serializedCanvas: Record<string, unknown>;
  height: number;
  width: number;
}
type CanvasMap = Map<number, CanvasEntry>;

export class CanvasStorage {
  private _canvasMap: CanvasMap;

  constructor() {
    this._canvasMap = new Map();
  }

  public get(id: number) {
    return this._canvasMap.get(id) ?? null;
  }

  /**
   * Stores the canvas state in the storage
   * @param id - Page id
   * @param canvas - Canvas instance
   */
  public serialize(id: number, canvas: fabric.Canvas) {
    const { height, width } = canvas;
    // TODO: Serialize to string
    const serializedCanvas: Record<string, unknown> = canvas.toObject(
      SERIALIZABLE_PROPERTIES
    );

    this._canvasMap.set(id, {
      serializedCanvas,
      height,
      width,
    });
  }

  /**
   * Restores the canvas state from the storage
   * @param id - Page id
   * @param canvas - Canvas instance
   * @returns Canvas instance with restored state
   */
  public deserialize(id: number, canvas: fabric.Canvas) {
    const canvasEntry = this._canvasMap.get(id);
    if (!canvasEntry) {
      return null;
    }

    return canvas.loadFromJSON(canvasEntry.serializedCanvas);
  }

  public set(id: number, props: Partial<CanvasEntry>) {
    const canvasEntry = this._canvasMap.get(id);
    if (!canvasEntry) {
      return;
    }
    this._canvasMap.set(id, {
      ...canvasEntry,
      ...props,
    });
  }
}
