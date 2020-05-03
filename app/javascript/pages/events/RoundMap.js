import React from 'react'
import PropTypes from 'prop-types'

import RoundMap from 'components/RoundMap'

const EventRoundMap = ({ match }) => {
  const eventId = Number(match.params.id)
  const roundId = Number(match.params.roundId)

  return <RoundMap eventId={eventId} roundId={roundId} />
}

EventRoundMap.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
      roundId: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default EventRoundMap
