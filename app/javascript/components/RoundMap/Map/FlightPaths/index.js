import React from 'react'
import { useSelector } from 'react-redux'

import FlightPath from './FlightPath'

const FlightPaths = () => {
  const selectedResults = useSelector(state =>
    state.eventRoundMap.selectedResults.map(resultId =>
      state.eventRoundMap.results.find(el => el.id === resultId)
    )
  )

  return (
    <>
      {selectedResults.map(el => (
        <FlightPath key={el.id} {...el} />
      ))}
    </>
  )
}

export default FlightPaths
