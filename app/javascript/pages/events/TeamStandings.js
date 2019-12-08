import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { loadTeams } from 'redux/events/teams'
import { PageContext } from 'components/PageContext'
import TeamStandings from 'components/TeamStandings'

const TeamStandingsPage = ({ eventId, editable }) => {
  const dispatch = useDispatch()

  const [competitors, setCompetitors] = useState([])

  const loadScoreboard = async eventId => {
    const url = `/api/v1/events/${eventId}/scoreboard.json`
    const {
      data: { competitors }
    } = await axios.get(url)

    setCompetitors(competitors)
  }

  useEffect(() => {
    loadScoreboard(eventId)
    dispatch(loadTeams(eventId))
  }, [eventId, dispatch])

  return (
    <PageContext value={{ eventId, editable }}>
      <TeamStandings competitors={competitors} />
    </PageContext>
  )
}

TeamStandingsPage.propTypes = {
  eventId: PropTypes.string.isRequired,
  editable: PropTypes.bool.isRequired
}

export default TeamStandingsPage
