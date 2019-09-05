import { h } from 'preact'

const maxAltitude = 3810
const minAltitude = 3048

const ExitAltitude = ({ altitude }) => {
  if (!altitude) return null

  return <span>Exit: {altitude}</span>
}

export default ExitAltitude
