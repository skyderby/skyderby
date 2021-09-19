const degreesToRadians = (degrees: number): number => degrees * (Math.PI / 180)
const radiansToDegrees = (radians: number): number => radians / (Math.PI / 180)

export type Vector = [number, number]

export const vectorFromMagnitudeAndDirection = (
  magnitude: number,
  direction: number
): Vector => [
  Math.cos(degreesToRadians(direction)) * magnitude,
  Math.sin(degreesToRadians(direction)) * magnitude
]

export const sumVectors = (...vectors: Vector[]) =>
  vectors.reduce((acc, current) => [acc[0] + current[0], acc[1] + current[1]])

export const getMagnitude = (vector: Vector): number =>
  Math.sqrt(vector.reduce((acc, val) => acc + val ** 2, 0))

export const getDirection = ([x, y]: Vector): number => radiansToDegrees(Math.atan2(y, x))
