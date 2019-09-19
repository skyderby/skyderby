import React from 'react'

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

export default ExitAltitude
