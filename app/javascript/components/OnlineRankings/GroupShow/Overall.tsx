import React from 'react'
import {
  OnlineRanking,
  OnlineRankingGroup,
  useOverallGroupStandingsQuery
} from 'api/onlineRankings'
import Scoreboard from './Scoreboard'

type Props = {
  group: OnlineRankingGroup
  windCancellation: boolean
  tasks: OnlineRanking['discipline'][]
  selectedTask: OnlineRanking['discipline'] | null
}

const Overall = ({ group, windCancellation, tasks, selectedTask }: Props) => {
  const { data: standings } = useOverallGroupStandingsQuery(group.id, {
    windCancellation,
    selectedTask
  })

  return <Scoreboard standings={standings} tasks={tasks} selectedTask={selectedTask} />
}

export default Overall
