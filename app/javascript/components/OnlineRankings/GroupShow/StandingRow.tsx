import React from 'react'
import { Link } from 'react-router-dom'
import { OnlineRanking } from 'api/onlineRankings'
import { GroupStandingsRow } from 'api/onlineRankings/groups'
import ProfileName from 'components/ProfileName'
import styles from './styles.module.scss'

const formatResult = (result: number | undefined, task: OnlineRanking['discipline']) => {
  if (!result) return

  return result.toFixed(task === 'distance' ? 0 : 1)
}

type Props = {
  row: GroupStandingsRow
  tasks: OnlineRanking['discipline'][]
  selectedTask: OnlineRanking['discipline'] | null
}

const StandingRow = ({ row, tasks, selectedTask }: Props) => {
  const tasksToShow = selectedTask ? [selectedTask] : tasks

  return (
    <tr>
      <td>{selectedTask ? row.results[selectedTask]?.rank : row.rank}</td>
      <td>
        <ProfileName id={row.profileId} />
      </td>
      {tasksToShow.map(task => (
        <React.Fragment key={task}>
          <td className={styles.alignRight}>
            {row.results[task] && (
              <Link
                to={`/tracks/${row.results[task]?.trackId}`}
                className={styles.result}
              >
                {formatResult(row.results[task]?.result, task)}
              </Link>
            )}
          </td>
          <td className={styles.alignRight}>{row.results[task]?.points?.toFixed(1)}</td>
        </React.Fragment>
      ))}
      {!selectedTask && (
        <td className={styles.alignRight}>{row.totalPoints.toFixed(1)}</td>
      )}
    </tr>
  )
}

export default StandingRow
