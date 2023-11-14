import React from 'react'
import { useParams } from 'react-router-dom'
import { useGroupQuery, useGroupStandingsQuery } from 'api/onlineRankings/groups'
import styles from './styles.module.scss'
import { useOnlineRankingsQuery, OnlineRanking } from 'api/onlineRankings'
import StandingRow from 'components/OnlineRankings/GroupShow/StandingRow'

const GroupShow = () => {
  const params = useParams()
  const id = Number(params.groupId)
  const { data: group } = useGroupQuery(id)
  const { data: onlineRankings } = useOnlineRankingsQuery<OnlineRanking[]>({
    select: data => data.items.filter(item => item.groupId === id)
  })
  const { data: standings } = useGroupStandingsQuery(id)

  const tasks = Array.from(new Set(onlineRankings.map(ranking => ranking.discipline)))

  return (
    <div>
      <h2>{group?.name}</h2>
      <table className={styles.scoreboardTable}>
        <thead>
          <tr>
            <th rowSpan={2}>#</th>
            <th rowSpan={2}>Competitor</th>
            {tasks.map(task => (
              <th key={task} colSpan={2}>
                {task}
              </th>
            ))}
          </tr>
          <tr>
            {tasks.map(task => (
              <React.Fragment key={task}>
                <th>m</th>
                <th>%</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        {standings.map(categoryStandings => (
          <tbody key={categoryStandings.category}>
            <tr>
              <td>{categoryStandings.category}</td>
            </tr>
            {categoryStandings.rows.map(row => (
              <StandingRow key={row.rank} row={row} tasks={tasks} />
            ))}
          </tbody>
        ))}
      </table>
    </div>
  )
}

export default GroupShow
