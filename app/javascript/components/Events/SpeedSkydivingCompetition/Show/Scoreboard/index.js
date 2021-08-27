import React, { useRef } from 'react'
import PropTypes from 'prop-types'

import {
  useCategoriesQuery,
  useRoundsQuery,
  useSpeedSkydivingCompetitionQuery
} from 'api/hooks/speedSkydivingCompetitions'
import { useStandingsQuery } from 'api/hooks/speedSkydivingCompetitions'
import useStickyTableHeader from 'hooks/useStickyTableHeader'
import ActionsBar from './ActionsBar'
import TableHeader from './TableHeader'
import TableBody from './TableBody'
import styles from './styles.module.scss'

const Scoreboard = ({ match }) => {
  const eventId = Number(match.params.eventId)
  const { data: standings, isLoading } = useStandingsQuery(eventId)
  const { data: rounds = [] } = useRoundsQuery(eventId)
  const { data: categories = [] } = useCategoriesQuery(eventId)
  const { data: event } = useSpeedSkydivingCompetitionQuery(eventId)
  const tableRef = useRef()
  const stickyContainerRef = useRef()

  const header = <TableHeader event={event} rounds={rounds} />

  const showStickyHeader = useStickyTableHeader(tableRef, stickyContainerRef)

  if (isLoading) return null

  return (
    <div className={styles.container}>
      {event.permissions.canEdit && <ActionsBar eventId={eventId} />}

      <div className={styles.stickyHeader} ref={stickyContainerRef}>
        {showStickyHeader && <table className={styles.scoreboardTable}>{header}</table>}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.scoreboardTable} ref={tableRef}>
          {header}

          <TableBody
            event={event}
            rounds={rounds}
            categories={categories}
            standings={standings}
          />
        </table>
      </div>
    </div>
  )
}

Scoreboard.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      eventId: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}
export default Scoreboard
