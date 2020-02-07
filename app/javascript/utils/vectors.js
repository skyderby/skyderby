const degreesToRadians = degrees => degrees * (Math.PI / 180)
const radiansToDegrees = radians => radians / (Math.PI / 180)

export const vectorFromMagnitudeAndDirection = (magnitude, direction) => [
  Math.cos(degreesToRadians(direction)) * magnitude,
  Math.sin(degreesToRadians(direction)) * magnitude
]

export const sumVectors = (...vectors) =>
  vectors.reduce((acc, current) => acc.map((component, idx) => component + current[idx]))

export const getMagnitude = vector =>
  Math.sqrt(vector.reduce((acc, val) => acc + val ** 2, 0))

export const getDirection = ([x, y]) => radiansToDegrees(Math.atan2(y, x))
