const getPointsAroundTime = <TPoint extends { flTime: number }>(
  points: TPoint[],
  time: number
) => {
  let start = 0
  let end = points.length - 1

  if (time < points[start].flTime) return null
  if (time > points[end].flTime) return null

  while (start <= end) {
    const middle = Math.floor((start + end) / 2)

    if (time === points[middle].flTime) {
      return [points[middle], points[Math.min(middle + 1, points.length - 1)]]
    }

    if (time <= points[middle].flTime && time >= points[middle - 1].flTime) {
      return [points[middle - 1], points[middle]]
    }

    if (time < points[middle].flTime) {
      end = middle - 1
    } else {
      start = middle + 1
    }
  }

  return null
}

export default getPointsAroundTime
