import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { selectAssignedReferencePoints } from 'redux/events/round/selectors'
import Marker from './Marker'

const ReferencePoints = ({ map }) => {
  const referencePoints = useSelector(selectAssignedReferencePoints)

  return (
    <>
      {referencePoints.map(el => (
        <Marker key={el.id} {...el} map={map} />
      ))}
    </>
  )
}

ReferencePoints.propTypes = {
  map: PropTypes.object.isRequired
}

export default ReferencePoints
