import React, { useState, useMemo, useEffect } from 'react'
import { ValueType } from 'react-select'
import { useQueryClient } from 'react-query'

import {
  Result,
  useCompetitorsQuery,
  usePerformanceCompetitionQuery,
  useResultsQuery,
  useRoundQuery
} from 'api/performanceCompetitions'
import { ProfileRecord, recordQueryKey } from 'api/profiles'
import shuffle from 'utils/shuffle'
import groupByJumpRun from 'utils/groupByJumpRun'
import PlayIcon from 'icons/play.svg'
import StopIcon from 'icons/stop.svg'
import Player from 'components/WingsuitPerformancePlayer'
import GroupSelect, { CompetitorRoundMapData } from './GroupSelect'
import styles from './styles.module.scss'

const buildGroups = <T extends { profile: ProfileRecord; result: Result }>(
  competitorsWithResults: T[]
) => {
  const topResults = Array.from(competitorsWithResults)
    .sort((a, b) => b.result.result - a.result.result)
    .filter((_val, idx) => idx < 4)

  const groups = groupByJumpRun(competitorsWithResults)

  return [
    {
      label: 'Top 4',
      options: shuffle(topResults).map(record => ({
        label: record.profile.name,
        value: record
      }))
    },
    ...groups.map((group, idx) => ({
      label: `Group ${idx + 1}`,
      options: shuffle(group).map(record => ({
        label: record.profile.name,
        value: record
      }))
    }))
  ]
}

type RoundReplayProps = {
  eventId: number
  roundId: number
}

const RoundReplay = ({ eventId, roundId }: RoundReplayProps) => {
  const queryClient = useQueryClient()
  const { data: event } = usePerformanceCompetitionQuery(eventId)
  const { data: round } = useRoundQuery(eventId, roundId)
  const { data: competitors = [] } = useCompetitorsQuery(eventId)
  const { data: results = [] } = useResultsQuery(eventId, {
    select: data => data.filter(result => result.roundId === roundId)
  })
  const [selectedCompetitors, setSelectedCompetitors] = useState<
    CompetitorRoundMapData[]
  >([])
  const [playing, setPlaying] = useState(false)

  const competitorsRoundMapData = useMemo(
    () =>
      competitors
        .map(competitor => {
          const result = results.find(
            ({ competitorId }) => competitor.id === competitorId
          )
          const profile = queryClient.getQueryData<ProfileRecord>(
            recordQueryKey(competitor.profileId)
          )
          return { ...competitor, result, profile }
        })
        .filter(
          <
            TIn extends {
              result: Result | undefined
              profile: ProfileRecord | undefined
            },
            TOut extends TIn & { result: Result; profile: ProfileRecord }
          >(
            record: TIn
          ): record is TOut => record.result !== undefined && record.profile !== undefined
        ),
    [competitors, results, queryClient]
  )

  const groups = useMemo(() => buildGroups(competitorsRoundMapData), [
    competitorsRoundMapData
  ])

  useEffect(() => {
    setSelectedCompetitors([])
  }, [roundId])

  if (!event || !round) return null

  const handleTriggerPlay = () => setPlaying(!playing)

  const handleGroupChange = (
    options: ValueType<{ value: CompetitorRoundMapData }, true>
  ) => {
    if (options === null) {
      setSelectedCompetitors([])
    } else {
      setSelectedCompetitors(options.map(option => option.value))
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.playerControls}>
        <GroupSelect
          value={selectedCompetitors}
          options={groups}
          onChange={handleGroupChange}
        />
        <button className={styles.playButton} onClick={handleTriggerPlay}>
          {playing ? <StopIcon /> : <PlayIcon />}
        </button>
      </div>

      <Player
        task={round.task}
        windowStart={event.rangeFrom}
        windowEnd={event.rangeTo}
        group={selectedCompetitors}
        playing={playing}
      />
    </div>
  )
}

export default RoundReplay
