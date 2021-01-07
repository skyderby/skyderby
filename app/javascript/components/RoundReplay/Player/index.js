import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'

import AltitudeChart from './AltitudeChart'
import CompetitorCards from './CompetitorCards'
import processPoints from './processPoints'
import getPathsUntilTime from './getPathsUntilTime'
import styles from './styles.module.scss'

const Player = ({ discipline, rangeFrom, rangeTo, group = [], playing }) => {
  const [playerPoints, setPlayerPoints] = useState([])

  const chartRef = useRef()
  const cardsRef = useRef()

  const playerTime = useRef()
  const prevFrameTime = useRef()
  const requestId = useRef()

  const distanceRange = useMemo(
    () =>
      playerPoints.reduce(
        (acc, points) => ({
          min: Math.min(acc.min, points[0]?.chartDistance),
          max: Math.max(acc.max, points[points.length - 1]?.chartDistance)
        }),
        { min: 0, max: 0 }
      ),
    [playerPoints]
  )

  useEffect(() => {
    if (group.length === 0) return

    setPlayerPoints(
      group.map(data => processPoints(discipline, rangeFrom, rangeTo, data))
    )
  }, [group, discipline, rangeFrom, rangeTo])

  const drawFrame = useCallback(
    time => {
      playerTime.current = playerTime.current + (time - prevFrameTime.current) / 1000

      const paths = playerPoints.map(currentPoints =>
        getPathsUntilTime(currentPoints, playerTime.current)
      )

      chartRef.current.drawFrame(paths)
      cardsRef.current.drawFrame(paths)

      prevFrameTime.current = performance.now()
      requestId.current = requestAnimationFrame(drawFrame)
    },
    [playerPoints]
  )

  useEffect(() => {
    if (playing) {
      playerTime.current = playerTime.current || 0
      prevFrameTime.current = performance.now()
      requestId.current = requestAnimationFrame(drawFrame)
    } else {
      cancelAnimationFrame(requestId.current)
    }
  }, [playing, drawFrame, rangeFrom, rangeTo, group])

  useEffect(() => {
    if (group.length === 0) return

    playerTime.current = 0
  }, [group, rangeFrom, rangeTo])

  return (
    <div className={styles.container}>
      <AltitudeChart
        ref={chartRef}
        distanceRange={distanceRange}
        rangeFrom={rangeFrom}
        rangeTo={rangeTo}
      />
      <CompetitorCards ref={cardsRef} group={group} discipline={discipline} />
    </div>
  )
}

Player.propTypes = {
  discipline: PropTypes.oneOf(['distance', 'speed', 'time']),
  rangeFrom: PropTypes.number,
  rangeTo: PropTypes.number,
  playing: PropTypes.bool.isRequired,
  group: PropTypes.array
}

export default Player
