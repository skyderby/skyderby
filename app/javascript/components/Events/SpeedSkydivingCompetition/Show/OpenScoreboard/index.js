import React, { useRef } from 'react'

import {
  useRoundsQuery,
  useOpenStandingsQuery,
  useSpeedSkydivingCompetitionQuery
} from 'api/speedSkydivingCompetitions'
import useStickyTableHeader from 'hooks/useStickyTableHeader'
import StandingRow from './StandingRow'
import TableHeader from '../ScoreboardHeader'
import styles from './styles.module.scss'

const OpenScoreboard = ({ eventId }) => {
  const { data: standings, isLoading } = useOpenStandingsQuery(eventId)
  const { data: event } = useSpeedSkydivingCompetitionQuery(eventId)
  const { data: rounds } = useRoundsQuery(eventId)
  const tableRef = useRef()
  const stickyContainerRef = useRef()

  const header = <TableHeader event={event} rounds={rounds} />

  const showStickyHeader = useStickyTableHeader(tableRef, stickyContainerRef)

  if (isLoading) return null

  return (
    <div className={styles.container}>
      <div className={styles.stickyHeader} ref={stickyContainerRef}>
        {showStickyHeader && <table className={styles.scoreboardTable}>{header}</table>}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.scoreboardTable} ref={tableRef}>
          {header}
          <tbody>
            {standings.map(row => (
              <StandingRow
                key={row.competitorId}
                event={event}
                rank={row.rank}
                total={row.total}
                competitorId={row.competitorId}
                average={row.average}
                rounds={rounds}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OpenScoreboard
