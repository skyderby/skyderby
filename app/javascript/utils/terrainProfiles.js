// Terrain profiles are measured relative to the exit, so the line always starts
// at the exit point even when it is not among the stored measurements.
export const withExitPoint = points => {
  const first = points[0]
  if (first && first.x === 0 && first.y === 0) return points

  return [{ x: 0, y: 0 }, ...points]
}
