import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { assignReferencePoint } from 'redux/events/roundMap'

import ReadOnly from './ReadOnly'
import Select from './Select'

const ReferencePoint = ({ resultId }) => {
  const dispatch = useDispatch()

  const { eventId, editable } = useSelector(state => state.eventRoundMap)
  const { referencePoint } = useSelector(state =>
    state.eventRoundMap.results.find(el => el.id === resultId)
  )

  const { items: referencePoints } = useSelector(
    state => state.eventReferencePoints[eventId] || {}
  )

  const handleChange = ({ value }) => {
    dispatch(assignReferencePoint(resultId, value))
  }

  return editable ? (
    <Select
      value={referencePoint}
      referencePoints={referencePoints}
      onChange={handleChange}
    />
  ) : (
    <ReadOnly referencePoint={referencePoint} />
  )
}

export default ReferencePoint
