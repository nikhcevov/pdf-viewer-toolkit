import { CircleProps, FabricObjectProps, FabricText, GroupProps } from "fabric/*";

export const POLIGON_CONFIG: Partial<FabricObjectProps> = {
  fill: "rgba(255,255,0,0.5)",
  strokeWidth: 1,
  stroke: "grey",
  objectCaching: false,
  transparentCorners: false,
  cornerColor: "rgba(0,0,255,0.5)",
  cornerStyle: "circle",
  selectable: false,
  hasBorders: false,
  hasControls: false,
};

export const LINE_CONFIG: Partial<FabricObjectProps> = {
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
};

export const CIRCLE_CONFIG: Partial<CircleProps> = {
  radius: 5,
  fill: "blue",
  originX: "center",
  originY: "center",
  hoverCursor: "auto",
  hasControls: false,
  selectable: false,
}

export const GROUP_CONFIG: Partial<GroupProps> = {
  lockMovementX: true,
  lockMovementY: true,
  subTargetCheck: true,
  hoverCursor: "pointer",
  hasControls: true,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  controls: {},
};

export const TEXT_CONFIG: Partial<FabricText> = {
  fontSize: 16,
  originX: "center",
  originY: "center",
}

const serializableProperties: string[] = [
  POLIGON_CONFIG,
  LINE_CONFIG,
  CIRCLE_CONFIG,
  GROUP_CONFIG,
  TEXT_CONFIG
].flatMap((config) => Object.keys(config));

export const SERIALIZABLE_PROPERTIES: string[] = [
  "creator",
  "controls",
  ...serializableProperties,
];

export enum PluginEvents {
  ChangeScale = "changeScale",
  SetUnit = "setUnit",
}
