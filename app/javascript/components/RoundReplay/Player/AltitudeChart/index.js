import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

import { drawChart, updateChart } from './utils'
import { drawHeight, drawWidth } from './constants'
import { Canvas } from './elements'

const AltitudeChart = forwardRef(({ rangeFrom, rangeTo }, ref) => {
  const canvasRef = useRef()

  const drawFrame = paths => {
    const ctx = canvasRef.current?.getContext('2d')

    updateChart(ctx, paths, rangeFrom, rangeTo)
  }

  useImperativeHandle(ref, () => ({ drawFrame }))

  useEffect(() => {
    if (!rangeFrom || !rangeTo) return

    const ctx = canvasRef.current?.getContext('2d')

    ctx.clearRect(0, 0, drawWidth, drawHeight)
    drawChart(ctx, rangeFrom, rangeTo)
  }, [rangeFrom, rangeTo])

  return <Canvas ref={canvasRef} width={drawWidth} height={drawHeight} />
})

AltitudeChart.displayName = 'AltitudeChart'

AltitudeChart.propTypes = {
  rangeFrom: PropTypes.number,
  rangeTo: PropTypes.number
}

export default AltitudeChart
