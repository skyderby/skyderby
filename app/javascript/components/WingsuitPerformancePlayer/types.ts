export type DistanceRange = {
  min: number
  max: number
}

export type PlayerPoint = {
  id: number
  playerTime: number
  altitude: number
  vSpeed: number
  chartDistance: number
  gpsTime: Date
  startTime: Date
  endTime: Date
  taskResult: number | undefined
}
