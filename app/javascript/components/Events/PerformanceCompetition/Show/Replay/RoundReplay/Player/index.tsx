import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'

import {
  Competitor,
  PerformanceCompetition,
  Result,
  Round
} from 'api/performanceCompetitions'
import AltitudeChart, { AltitudeChartHandle } from './AltitudeChart'
import CompetitorCards, { CompetitorCardsHandle } from './CompetitorCards'
import processPoints from './processPoints'
import getPathsUntilTime from './getPathsUntilTime'
import styles from './styles.module.scss'
import { Profile } from 'api/profiles'
import { useQueryClient } from '@tanstack/react-query'
import { fetchResultPoints } from 'components/Events/PerformanceCompetition/useResultPoints'
import { PlayerPoint } from './types'

type PlayerProps = {
  event: PerformanceCompetition
  task: Round['task']
  playing: boolean
  group: (Competitor & { result: Result; profile: Profile })[]
}

const Player = ({ event, task, group = [], playing }: PlayerProps) => {
  const queryClient = useQueryClient()
  const [playerPoints, setPlayerPoints] = useState<PlayerPoint[][]>([])

  const chartRef = useRef<AltitudeChartHandle>(null)
  const cardsRef = useRef<CompetitorCardsHandle>(null)

  const playerTime = useRef<number>(0)
  const prevFrameTime = useRef<number>(0)
  const requestId = useRef<number>()

  const { rangeFrom, rangeTo } = event
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
        ...(await fetchResultPoints(queryClient, event, record.result))
      }))
    )
      .then(group =>
        group.map(record => processPoints(task, event.rangeFrom, event.rangeTo, record))
      )
      .then(group => setPlayerPoints(group))
  }, [event, queryClient, group, task])

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
      <CompetitorCards ref={cardsRef} group={group} />
    </div>
  )
}

export default Player
