import React, { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'

import { drawChart, updateChart } from './altitudeChart'
import { drawCards, updateCardNumbers } from './cards'
import processPoints from './processPoints'
import { drawHeight, drawWidth } from './constants'
import getPathsUntilTime from './getPathsUntilTime'
import { Canvas } from './elements'

const Player = ({ discipline, group = [], playing }) => {
  const [playerPoints, setPlayerPoints] = useState()

  const canvasRef = useRef()
  const startTime = useRef()
  const requestId = useRef()

  useEffect(() => {
    if (group.length === 0) return

    setPlayerPoints(group.map(data => processPoints(discipline, data)))
  }, [group, discipline])

  const drawFrame = useCallback(
    time => {
      const timeDiff = (time - startTime.current) / 1000
      const ctx = canvasRef.current.getContext('2d')

      const paths = playerPoints.map(currentPoints =>
        getPathsUntilTime(currentPoints, timeDiff)
      )

      updateCardNumbers(ctx, paths, discipline)
      updateChart(ctx, paths)

      requestId.current = requestAnimationFrame(drawFrame)
    },
    [discipline, playerPoints]
  )

  useEffect(() => {
    if (playing) {
      const canvas = canvasRef.current

      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, drawWidth, drawHeight)
      drawChart(ctx)
      drawCards(ctx, group)

      startTime.current = performance.now()
      requestId.current = requestAnimationFrame(drawFrame)
    } else {
      cancelAnimationFrame(requestId.current)
    }
  }, [playing, drawFrame, group])

  useEffect(() => {
    if (group.length === 0) return

    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, drawWidth, drawHeight)

    drawChart(ctx)
    drawCards(ctx, group)
  }, [group])

  return <Canvas ref={canvasRef} width={drawWidth} height={drawHeight} />
}

Player.propTypes = {
  discipline: PropTypes.oneOf(['distance', 'speed', 'time']),
  playing: PropTypes.bool.isRequired,
  group: PropTypes.array
}

export default Player
