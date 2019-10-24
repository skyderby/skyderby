import React from 'react'
import { useSelector } from 'react-redux'

import { selectAssignedReferencePoints } from 'redux/events/roundMap/selectors'
import Marker from './Marker'

const ReferencePoints = () => {
  const referencePoints = useSelector(selectAssignedReferencePoints)

  return (
    <>
      {referencePoints.map(el => (
        <Marker key={el.id} {...el} />
      ))}
    </>
  )
}

export default ReferencePoints
