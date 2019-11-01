import React from 'react'
import { useSelector } from 'react-redux'

import { selectSelectedResults } from 'redux/events/round/selectors'
import FlightPath from './FlightPath'

const FlightPaths = () => {
  const selectedResults = useSelector(selectSelectedResults)

  return (
    <>
      {selectedResults.map(el => (
        <FlightPath key={el.id} {...el} />
      ))}
    </>
  )
}

export default FlightPaths
