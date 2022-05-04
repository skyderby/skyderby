const getPointsAround = <TPoint>(
  points: TPoint[],
  predicate: (a: TPoint, b: TPoint) => boolean
) => {
  for (let idx = 0; idx < points.length; idx++) {
    if (idx === 0) continue

    const first = points[idx - 1]
    const second = points[idx]

    if (!first || !second) continue

    if (predicate(first, second)) return [first, second]
  }

  return null
}

export default getPointsAround
