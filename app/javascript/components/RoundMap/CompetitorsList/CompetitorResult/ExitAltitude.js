import React from 'react'
import PropTypes from 'prop-types'

const maxAltitude = 3810
const minAltitude = 3048

const ExitAltitude = ({ altitude }) => {
  if (!altitude) return null

  const showWarning = altitude < minAltitude || altitude > maxAltitude

  return (
    <span>
      {showWarning && <i className="fa fa-exclamantion-triangle text-warning" />}
      Exit: {altitude}
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
