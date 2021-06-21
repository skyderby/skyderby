import { useEffect, useMemo, useRef } from 'react'

const Trajectory = ({ Cesium, viewer, points }) => {
  const entity = useRef()
  const startTime = Cesium.JulianDate.fromDate(new Date(points[0].gpsTime))
  const stopTime = Cesium.JulianDate.fromDate(new Date(points[points.length - 1].gpsTime))

  const trajectory = useMemo(
    () =>
      points.reduce((acc, point) => {
        acc.addSample(
          Cesium.JulianDate.fromDate(new Date(point.gpsTime)),
          Cesium.Cartesian3.fromDegrees(
            point.longitude,
            point.latitude,
            point.absAltitude
          )
        )

        return acc
      }, new Cesium.SampledPositionProperty()),
    [Cesium, points]
  )

  useEffect(() => {
    if (!viewer) return

    entity.current = viewer.entities.add({
      availability: new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({ start: startTime, stop: stopTime })
      ]),
      position: trajectory,
      orientation: new Cesium.VelocityOrientationProperty(trajectory),
      ellipsoid: {
        radii: new Cesium.Cartesian3(10.0, 10.0, 10.0),
        material: Cesium.Color.RED
      },
      path: {
        resolution: 1,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.1,
          color: Cesium.Color.YELLOW
        }),
        width: 10
      }
    })

    viewer.zoomTo(
      entity.current,
      new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(90),
        Cesium.Math.toRadians(-20),
        2500
      )
    )
  }, [Cesium, startTime, stopTime, trajectory, viewer])

  return null
}

export default Trajectory
