import React from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const ReadOnly = ({ className, referencePointId }) => {
  const { eventId } = useSelector(state => state.eventRoundMap)

  const referencePoint = useSelector(state =>
    state.eventReferencePoints[eventId].items.find(({ id }) => id === referencePointId)
  )

  if (!referencePoint) return null

  return (
    <div className={className}>
      <i className="fa fa-map-marker-alt" />
      {referencePoint.name}
    </div>
  )
}

ReadOnly.propTypes = {
  className: PropTypes.string.isRequired,
  referencePointId: PropTypes.number
}

export default styled(ReadOnly)`
  margin-left: auto;
  display: flex;
  align-items: center;

  i {
    color: #999;
    font-size: 10px;
    line-height: 17px;
    margin-right: 3px;
  }
`
