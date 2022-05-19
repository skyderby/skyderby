import React, { useRef } from 'react'
import {
  usePerformanceCompetitionQuery,
  useTeamStandingsQuery
} from 'api/performanceCompetitions'
import useStickyTableHeader from 'hooks/useStickyTableHeader'
import ActionsBar from './ActionsBar'
import StandingRow from './StandingRow'
import styles from './styles.module.scss'

type TeamsScoreboardProps = {
  eventId: number
}

const TeamsScoreboard = ({ eventId }: TeamsScoreboardProps) => {
  const { data: teamStandings = [], isLoading } = useTeamStandingsQuery(eventId)
  const { data: event } = usePerformanceCompetitionQuery(eventId)

  const tableRef = useRef<HTMLTableElement>(null)
  const stickyContainerRef = useRef<HTMLDivElement>(null)
  const showStickyHeader = useStickyTableHeader(tableRef, stickyContainerRef)

  const header = (
    <thead>
      <tr>
        <th>#</th>
        <th>Team</th>
        <th>Total</th>
      </tr>
    </thead>
  )

  if (isLoading || !event) return null

  return (
    <div className={styles.container}>
      {event.permissions.canEdit && <ActionsBar eventId={eventId} />}

      <div className={styles.stickyHeader} ref={stickyContainerRef}>
        {showStickyHeader && <table className={styles.scoreboardTable}>{header}</table>}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.scoreboardTable} ref={tableRef}>
          {header}

          <tbody>
            {teamStandings.map(row => (
              <StandingRow
                key={row.teamId}
                event={event}
                teamId={row.teamId}
                rank={row.rank}
                total={row.total}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TeamsScoreboard
