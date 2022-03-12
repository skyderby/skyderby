import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { assignReferencePoint } from 'redux/events/round/referencePointAssignments'
import { selectReferencePoints } from 'redux/events/round/selectors'

import ReadOnly from './ReadOnly'
import Select from './Select'

const ReferencePoint = ({ competitorId }) => {
  const dispatch = useDispatch()

  const { editable } = useSelector(state => state.eventRound)
  const { referencePointId } = useSelector(
    state =>
      state.eventRound.referencePointAssignments.find(
        el => el.competitorId === competitorId
      ) || {}
  )

  const referencePoints = useSelector(selectReferencePoints)

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

ReferencePoint.propTypes = {
  competitorId: PropTypes.number.isRequired
}

export default ReferencePoint
