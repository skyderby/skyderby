import React from 'react'
import PropTypes from 'prop-types'

const Overview = ({ match }) => {
  const placeId = Number(match.params.id)

  return <div>Overview {placeId}</div>
}

Overview.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default Overview
