export function calculatePolygonArea(vertices: { x: number; y: number }[]) {
  let total = 0;

  for (let i = 0, l = vertices.length; i < l; i++) {
    const addX = vertices[i].x;
    const addY = vertices[i == vertices.length - 1 ? 0 : i + 1].y;
    const subX = vertices[i == vertices.length - 1 ? 0 : i + 1].x;
    const subY = vertices[i].y;

    total += addX * addY * 0.5;
    total -= subX * subY * 0.5;
  }

  return Math.abs(total);
}
