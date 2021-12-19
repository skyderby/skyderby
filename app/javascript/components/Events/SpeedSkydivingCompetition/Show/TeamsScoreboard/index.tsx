import React, { useRef } from 'react'

import {
  useSpeedSkydivingCompetitionQuery,
  useTeamStandingsQuery
} from 'api/speedSkydivingCompetitions'
import ActionsBar from './ActionsBar'
import styles from './styles.module.scss'
import StandingRow from 'components/Events/SpeedSkydivingCompetition/Show/TeamsScoreboard/StandingRow'
import useStickyTableHeader from 'hooks/useStickyTableHeader'

type TeamsScoreboardProps = {
  eventId: number
}

const TeamsScoreboard = ({ eventId }: TeamsScoreboardProps): JSX.Element | null => {
  const { data: teamStandings = [], isLoading } = useTeamStandingsQuery(eventId)
  const { data: event } = useSpeedSkydivingCompetitionQuery(eventId)

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
