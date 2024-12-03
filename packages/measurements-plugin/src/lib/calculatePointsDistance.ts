export function calculatePointsDistance(
  startPoint: { x: number; y: number },
  endPoint: { x: number; y: number }
) {
  const a = startPoint.x - endPoint.x;
  const b = startPoint.y - endPoint.y;
  const lineDistance = Math.sqrt(a * a + b * b);

  return lineDistance;
}
