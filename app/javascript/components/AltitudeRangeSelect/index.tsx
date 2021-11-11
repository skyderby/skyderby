import React, { useState, memo } from 'react'
import { Chart } from 'highcharts'

import { PointRecord, useTrackPointsQuery } from 'api/tracks/points'
import Highchart from 'components/Highchart'
import RangeSlider from 'components/RangeSlider'
import AltitudeChart from 'components/AltitudeChart'

import styles from './styles.module.scss'

type Value = {
  from: number
  to: number
}

type AltitudeRangeSelectProps = {
  trackId: number
  value: Value
  onChange: (value: Value) => unknown
}

type Range = [number, number]
const isValidRange = (value: readonly number[]): value is Range => {
  return value.length === 2 && Number.isFinite(value[0]) && Number.isFinite(value[1])
}

const getJumpDuration = (points: PointRecord[]) => {
  const minFlightTime = 1

  if (points.length === 0) return minFlightTime
  const lastPoint = points[points.length - 1]

  return lastPoint?.flTime || minFlightTime
}

const AltitudeRangeSelect = ({
  trackId,
  value: initialValue,
  onChange: onChangeCallback
}: AltitudeRangeSelectProps): JSX.Element => {
  const [value, setValue] = useState(initialValue)

  const { data: points = [], isLoading } = useTrackPointsQuery(trackId, {
    trimmed: false
  })
  const jumpDuration = getJumpDuration(points)

  const handleUpdate = (values: readonly number[]) => {
    if (!isValidRange(values)) return

    const newValue = { from: values[0], to: values[1] }
    if (value.from === newValue.from && value.to === newValue.to) return

    setValue(newValue)
  }

  const handleChange = (values: readonly number[]) => {
    if (!isValidRange(values)) return

    onChangeCallback?.({ from: values[0], to: values[1] })
  }

  return (
    <div className={styles.container}>
      <AltitudeChart
        points={points}
        options={{ chart: { zoomType: 'x' } }}
        loading={isLoading}
      >
        {(chart: Chart) => (
          <>
            <Highchart.Plotband
              id="from"
              chart={chart}
              from={0}
              to={value.from}
              color="rgba(0, 0, 0, 0.25)"
              zIndex={5}
            />
            <Highchart.Plotband
              id="to"
              chart={chart}
              from={value.to}
              to={jumpDuration}
              color="rgba(0, 0, 0, 0.25)"
              zIndex={5}
            />
          </>
        )}
      </AltitudeChart>

      <RangeSlider
        domain={[0, jumpDuration]}
        values={[value.from, value.to]}
        step={1}
        onUpdate={handleUpdate}
        onChange={handleChange}
      />
    </div>
  )
}

export default memo(AltitudeRangeSelect)
