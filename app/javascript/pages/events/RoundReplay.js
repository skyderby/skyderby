import React from 'react'
import PropTypes from 'prop-types'

import AppShell from 'components/AppShell'
import RoundReplay from 'components/RoundReplay'

const EventRoundReplay = ({ match }) => {
  const eventId = Number(match.params.id)
  const roundId = Number(match.params.roundId)

  return (
    <AppShell>
      <RoundReplay eventId={eventId} roundId={roundId} />
    </AppShell>
  )
}

EventRoundReplay.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
      roundId: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default EventRoundReplay
