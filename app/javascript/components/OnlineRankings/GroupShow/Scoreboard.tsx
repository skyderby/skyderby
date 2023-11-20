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
}

const Scoreboard = ({ standings, tasks }: Props) => {
  const { t } = useI18n()
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.scoreboardTable}>
        <thead>
          <tr>
            <th rowSpan={2}>#</th>
            <th rowSpan={2}>Competitor</th>
            {tasks.map(task => (
              <th key={task} colSpan={2}>
                {t(`disciplines.${task}`)}
              </th>
            ))}
          </tr>
          <tr>
            {tasks.map(task => (
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
              <td colSpan={2 + tasks.length * 2}>{categoryStandings.category}</td>
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

export default Scoreboard
