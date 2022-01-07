import React, { useState, useEffect } from 'react'
import client from 'api/client'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { loadTeams } from 'redux/events/teams'
import { PageContext } from 'components/PageContext'
import AppShell from 'components/AppShell'
import TeamStandings from 'components/TeamStandings'

const TeamStandingsPage = ({ match }) => {
  const eventId = Number(match.params.id)
  const editable = false // FIXME: fetch from server
  const dispatch = useDispatch()

  const [competitors, setCompetitors] = useState([])

  const loadScoreboard = async eventId => {
    const url = `/api/v1/events/${eventId}/scoreboard.json`
    const {
      data: { competitors }
    } = await client.get(url)

    setCompetitors(competitors)
  }

  useEffect(() => {
    loadScoreboard(eventId)
    dispatch(loadTeams(eventId))
  }, [eventId, dispatch])

  return (
    <AppShell>
      <PageContext value={{ eventId, editable }}>
        <TeamStandings competitors={competitors} />
      </PageContext>
    </AppShell>
  )
}

TeamStandingsPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default TeamStandingsPage
