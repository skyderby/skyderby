import React from 'react'
import styled from 'styled-components'

const ReadOnly = ({ className, referencePoint }) => {
  if (!referencePoint) return null

  return (
    <div className={className}>
      <i className="fa fa-map-marker-alt" />
      {referencePoint.name}
    </div>
  )
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
