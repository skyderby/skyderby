import { h } from 'preact'
import styled from 'styled-components'
import { useState, useEffect, useRef } from 'preact/compat'

import { drawChart, updateChart } from './altitudeChart'
import { drawCards, updateCardNumbers } from './cards'
import processPoints from './processPoints'
import { drawHeight, drawWidth } from './constants'
import getPathsUntilTime from './getPathsUntilTime'

const Player = ({ discipline, group = [], playing }) => {
  const [playerPoints, setPlayerPoints] = useState()

  const canvasRef = useRef()
  const startTime = useRef()
  const requestId = useRef()

  useEffect(() => {
    if (group.length === 0) return

    setPlayerPoints(group.map(data => processPoints(discipline, data)))
  }, [group])

  const drawFrame = time => {
    const timeDiff = (time - startTime.current) / 1000
    const ctx = canvasRef.current.getContext('2d')

    const paths = playerPoints.map(currentPoints =>
      getPathsUntilTime(currentPoints, timeDiff)
    )

    updateCardNumbers(ctx, paths, discipline)
    updateChart(ctx, paths)

    requestId.current = requestAnimationFrame(drawFrame)
  }

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
  }, [playing])

  useEffect(() => {
    if (group.length === 0) return

    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, drawWidth, drawHeight)

    drawChart(ctx)
    drawCards(ctx, group)
  }, [group])

  return <Canvas ref={canvasRef} width={drawWidth} height={drawHeight} />
}

const Canvas = styled.canvas`
  width: 180vh;
  margin-left: auto;
  margin-right: auto;
`

export default Player
