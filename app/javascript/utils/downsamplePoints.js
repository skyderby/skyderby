const downsamplePoints = (points, maxPoints = 500) => {
  if (!points || points.length <= maxPoints) return points

  const step = (points.length - 1) / (maxPoints - 1)
  const result = []

  for (let i = 0; i < maxPoints - 1; i++) {
    result.push(points[Math.round(i * step)])
  }

  result.push(points[points.length - 1])

  return result
}

export default downsamplePoints
