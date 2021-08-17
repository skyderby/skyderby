import React from 'react'
import PropTypes from 'prop-types'

const maxAltitude = 3353
const minAltitude = 3200

const ExitAltitude = ({ altitude }) => {
  if (!altitude) return null

  const showWarning = altitude < minAltitude || altitude > maxAltitude

  return (
    <span>
      Exit: {altitude}m
      {showWarning && (
        <>
          &nbsp;
          <i className="fas fa-exclamation-triangle text-warning" />
        </>
      )}
    </span>
  )
}

ExitAltitude.propTypes = {
  altitude: PropTypes.number
}

ExitAltitude.defaultProps = {
  altitude: undefined
}

export default ExitAltitude
