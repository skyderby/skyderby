import React from 'react'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { useGroupQuery } from 'api/onlineRankings/groups'
import { useOnlineRankingsQuery, OnlineRanking, tasksEnum } from 'api/onlineRankings'
import Header from './Header'
import ActionsBar from './ActionsBar'
import Overall from './Overall'
import Year from './Year'
import styles from './styles.module.scss'

const redirectPath = (groupId: number, lastYear: number | undefined) => {
  const baseUrl = `/online_rankings/groups/${groupId}`
  if (!lastYear) return `${baseUrl}/overall`

  return `${baseUrl}/year/${lastYear}`
}

const sanitizeTask = (task: string | null | undefined) => {
  const result = tasksEnum.safeParse(task)

  if (!result.success) return null
  return result.data
}

const GroupShow = () => {
  const params = useParams()
  const id = Number(params.groupId)
  const location = useLocation()
  const urlParams = new URLSearchParams(location.search)
  const selectedTask = sanitizeTask(urlParams.get('task'))
  const windCancellation = urlParams.get('windCancellation') !== 'false'
  const { data: group } = useGroupQuery(id)
  const { data: onlineRankings } = useOnlineRankingsQuery<OnlineRanking[]>({
    select: data => data.filter(item => item.groupId === id)
  })
  const years = Array.from(
    new Set(onlineRankings.flatMap(onlineRanking => onlineRanking.years))
  ).sort()

  const tasks = Array.from(new Set(onlineRankings.map(ranking => ranking.discipline)))

  return (
    <div className={styles.container}>
      <Header onlineRankingGroup={group} years={years} />

      <div className={styles.scoreboardContainer}>
        <ActionsBar
          tasks={tasks}
          selectedTask={selectedTask}
          windCancellation={windCancellation}
        />

        <Routes>
          <Route
            path="/overall"
            element={
              <Overall
                group={group}
                windCancellation={windCancellation}
                tasks={tasks}
                selectedTask={selectedTask}
              />
            }
          />
          <Route
            path="/year/:year"
            element={
              <Year
                group={group}
                windCancellation={windCancellation}
                tasks={tasks}
                selectedTask={selectedTask}
              />
            }
          />
          <Route
            path="*"
            element={<Navigate to={redirectPath(group.id, years[years.length - 1])} />}
          />
        </Routes>
      </div>
    </div>
  )
}

export default GroupShow
