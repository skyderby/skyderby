import React from 'react'
import { taskUnitsTranslationKey } from 'utils/formatResult'
import { useI18n } from 'components/TranslationsProvider'
import { GroupStandings } from 'api/onlineRankings/groups/useOverallGroupStandingsQuery'
import { OnlineRanking } from 'api/onlineRankings'
import StandingRow from './StandingRow'
import styles from './styles.module.scss'

type Props = {
  standings: GroupStandings[]
  tasks: OnlineRanking['discipline'][]
  selectedTask: OnlineRanking['discipline'] | null
}

const Scoreboard = ({ standings, tasks, selectedTask }: Props) => {
  const { t } = useI18n()
  const tasksToShow = selectedTask ? [selectedTask] : tasks
  const showTotal = tasksToShow.length > 1

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.scoreboardTable}>
        <thead>
          <tr>
            <th rowSpan={2}>#</th>
            <th rowSpan={2}>Competitor</th>
            {tasksToShow.map(task => (
              <th key={task} colSpan={2}>
                {t(`disciplines.${task}`)}
              </th>
            ))}
            {showTotal && <th rowSpan={2}>{t('events.show.total')}</th>}
          </tr>
          <tr>
            {tasksToShow.map(task => (
              <React.Fragment key={task}>
                <th>{t(taskUnitsTranslationKey[task])}</th>
                <th>%</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        {standings.map(categoryStandings => (
          <tbody key={categoryStandings.category}>
            <tr>
              <td
                colSpan={2 + (showTotal ? 1 : 0) + tasksToShow.length * 2}
                className={styles.category}
              >
                {categoryStandings.category}
              </td>
            </tr>
            {categoryStandings.rows.map(row => (
              <StandingRow
                key={`${categoryStandings.category}-${row.profileId}`}
                row={row}
                tasks={tasks}
                selectedTask={selectedTask}
              />
            ))}
          </tbody>
        ))}
      </table>
    </div>
  )
}

export default Scoreboard
