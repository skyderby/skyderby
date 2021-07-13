import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { selectSelectedResults } from 'redux/events/round/selectors'
import FlightPath from './FlightPath'

const FlightPaths = ({ map }) => {
  const selectedResults = useSelector(selectSelectedResults)

  return (
    <>
      {selectedResults.map(el => (
        <FlightPath key={el.id} {...el} map={map} />
      ))}
    </>
  )
}

FlightPaths.propTypes = {
  map: PropTypes.object.isRequired
}

export default FlightPaths
