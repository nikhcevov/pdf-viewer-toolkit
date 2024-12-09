/**
 * Callback fired on measurement scale change with `scale` tool
 */
export type OnScaleChangeType = (props: { measurement: number }) => void;

export interface UnitUpdatePayloadType {
  unit: number;
}

declare module "fabric" {
  // to have the properties recognized on the instance and in the constructor
  interface FabricObject {
    creator?: "areatool" | "scaletool";
  }
  // to have the properties typed in the exported object
  interface SerializedObjectProps {
    creator?: "areatool" | "scaletool";
  }
}
