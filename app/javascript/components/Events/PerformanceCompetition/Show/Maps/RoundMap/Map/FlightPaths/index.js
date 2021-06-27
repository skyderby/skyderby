import React from 'react'
import { useSelector } from 'react-redux'

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

export default FlightPaths
