import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { QueryClient, useQueryClient } from 'react-query'
import cx from 'clsx'

import { Competitor, Result, Round } from 'api/performanceCompetitions'
import { ProfileRecord } from 'api/profiles'
import { pointsQuery } from 'api/tracks/points'
import getPointForAltitude from 'utils/getPointForAltitude'
import AltitudeChart, { AltitudeChartHandle } from './AltitudeChart'
import CompetitorCards, { CompetitorCardsHandle } from './CompetitorCards'
import processPoints from './processPoints'
import getPathsUntilTime from './getPathsUntilTime'
import { PlayerPoint } from './types'
import styles from './styles.module.scss'

type PlayerProps = {
  windowStart: number
  windowEnd: number
  task: Round['task']
  playing: boolean
  group: (Competitor & { result: Result; profile: ProfileRecord })[]
  cardsPosition: 'right' | 'bottom'
}

const fetchTrackPoints = async (
  queryClient: QueryClient,
  trackId: number,
  windowStart: number,
  windowEnd: number
) => {
  const points = await queryClient.fetchQuery(
    pointsQuery(trackId, {
      trimmed: { secondsBeforeStart: 7 },
      originalFrequency: true
    })
  )

  const startPoint = getPointForAltitude(points, windowStart)
  const endPoint = getPointForAltitude(points, windowEnd)

  return { points, startPoint, endPoint }
}

const Player = ({
  task,
  windowStart,
  windowEnd,
  group = [],
  playing,
  cardsPosition = 'right'
}: PlayerProps) => {
  const queryClient = useQueryClient()
  const [playerPoints, setPlayerPoints] = useState<PlayerPoint[][]>([])

  const chartRef = useRef<AltitudeChartHandle>(null)
  const cardsRef = useRef<CompetitorCardsHandle>(null)

  const playerTime = useRef<number>(0)
  const prevFrameTime = useRef<number>(0)
  const requestId = useRef<number>()

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

    Promise.all(
      group.map(async record => ({
        ...record,
        ...(await fetchTrackPoints(
          queryClient,
          record.result.trackId,
          windowStart,
          windowEnd
        ))
      }))
    )
      .then(group =>
        group.map(record => processPoints(task, windowStart, windowEnd, record))
      )
      .then(group => setPlayerPoints(group))
  }, [queryClient, group, task, windowStart, windowEnd])

  const drawFrame = useCallback(
    (time: number) => {
      playerTime.current = playerTime.current + (time - prevFrameTime.current) / 1000

      const paths = playerPoints.map(currentPoints =>
        getPathsUntilTime(currentPoints, playerTime.current, task)
      )

      chartRef.current?.drawFrame(paths)
      cardsRef.current?.drawFrame(paths)

      prevFrameTime.current = performance.now()
      requestId.current = requestAnimationFrame(drawFrame)
    },
    [playerPoints, task]
  )

  useEffect(() => {
    if (playing) {
      playerTime.current = playerTime.current || 0
      prevFrameTime.current = performance.now()
      requestId.current = requestAnimationFrame(drawFrame)
    } else {
      requestId.current && cancelAnimationFrame(requestId.current)
    }
  }, [playing, drawFrame, windowStart, windowEnd, group])

  useEffect(() => {
    if (group.length === 0) return

    playerTime.current = 0
  }, [group, windowStart, windowEnd])

  return (
    <div className={cx(styles.container, cardsPosition === 'bottom' && styles.vertical)}>
      <AltitudeChart
        ref={chartRef}
        distanceRange={distanceRange}
        rangeFrom={windowStart}
        rangeTo={windowEnd}
      />
      <CompetitorCards
        ref={cardsRef}
        group={group}
        horizontal={cardsPosition === 'bottom'}
      />
    </div>
  )
}

export default Player
