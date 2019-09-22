import React from 'react'
import { useSelector } from 'react-redux'

import Marker from './Marker'

const usedReferencePoints = state => {
  const { eventId, referencePointAssignments } = state.eventRoundMap

  if (!eventId || !state.eventReferencePoints[eventId]) return []

  const ids = [
    ...new Set(referencePointAssignments.map(el => el.referencePointId).filter(el => el))
  ]

  const { items: allReferencePoints = [] } = state.eventReferencePoints[eventId] || {}

  return ids.map(id => allReferencePoints.find(el => el.id === id))
}

const ReferencePoints = () => {
  const referencePoints = useSelector(usedReferencePoints)

  return (
    <>
      {referencePoints.map(el => (
        <Marker key={el.id} {...el} />
      ))}
    </>
  )
}

export default ReferencePoints
