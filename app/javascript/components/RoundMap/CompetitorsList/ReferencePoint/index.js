import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { assignReferencePoint } from 'redux/events/roundMap'

import ReadOnly from './ReadOnly'
import Select from './Select'

const ReferencePoint = ({ competitorId }) => {
  const dispatch = useDispatch()

  const { eventId, editable } = useSelector(state => state.eventRoundMap)
  const { referencePointId } = useSelector(
    state =>
      state.eventRoundMap.referencePointAssignments.find(
        el => el.competitorId === competitorId
      ) || {}
  )

  const { items: referencePoints } = useSelector(
    state => state.eventReferencePoints[eventId] || {}
  )

  const handleChange = ({ value }) => {
    dispatch(assignReferencePoint(competitorId, value))
  }

  return editable ? (
    <Select
      value={referencePointId}
      referencePoints={referencePoints}
      onChange={handleChange}
    />
  ) : (
    <ReadOnly referencePointId={referencePointId} />
  )
}

export default ReferencePoint
