import React from 'react'
import {
  OnlineRanking,
  OnlineRankingGroup,
  useAnnualGroupStandingsQuery
} from 'api/onlineRankings'
import Scoreboard from './Scoreboard'
import { useParams } from 'react-router-dom'

type Props = {
  group: OnlineRankingGroup
  windCancellation: boolean
  tasks: OnlineRanking['discipline'][]
  selectedTask: OnlineRanking['discipline'] | null
}

const Year = ({ group, windCancellation, tasks, selectedTask }: Props) => {
  const params = useParams()
  const year = Number(params.year)
  const { data: standings } = useAnnualGroupStandingsQuery(group.id, year, {
    windCancellation,
    selectedTask
  })

  return <Scoreboard standings={standings} tasks={tasks} selectedTask={selectedTask} />
}

export default Year
