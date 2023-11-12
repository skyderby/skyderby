import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react'

import { drawChart, updateChart } from './utils'
import { drawHeight, drawWidth } from './constants'
import styles from './styles.module.scss'
import { PlayerPoint } from '../types'

type AltitudeChartProps = {
  distanceRange: { min: number; max: number }
  rangeFrom: number
  rangeTo: number
}

export type AltitudeChartHandle = {
  drawFrame: (paths: PlayerPoint[][]) => unknown
}

const AltitudeChart = forwardRef<AltitudeChartHandle, AltitudeChartProps>(
  ({ distanceRange, rangeFrom, rangeTo }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const drawFrame = (paths: PlayerPoint[][]) => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return

      updateChart(ctx, paths, rangeFrom, rangeTo, distanceRange)
    }

    useImperativeHandle(ref, () => ({ drawFrame }))

    useEffect(() => {
      if (!rangeFrom || !rangeTo) return

      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, drawWidth, drawHeight)
      drawChart(ctx, rangeFrom, rangeTo)
    }, [rangeFrom, rangeTo])

    return (
      <canvas
        className={styles.canvas}
        ref={canvasRef}
        width={drawWidth}
        height={drawHeight}
      />
    )
  }
)

AltitudeChart.displayName = 'AltitudeChart'

export default AltitudeChart
