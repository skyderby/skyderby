import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const defaultPenaltyColor = '#f0ad4e'
const majorPenaltyColor = '#d9534f'

const PenaltyLabel = ({ className, penalized, penaltySize }) => {
  if (!penalized) return null

  return <span className={className}>-{penaltySize}%</span>
}

PenaltyLabel.propTypes = {
  className: PropTypes.string.isRequired,
  penalized: PropTypes.bool,
  penaltySize: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}

PenaltyLabel.defaultProps = {
  penalized: false,
  penaltySize: undefined
}

export default styled(PenaltyLabel)`
  align-self: center;
  background-color: ${props =>
    Number(props.penaltySize) <= 20 ? defaultPenaltyColor : majorPenaltyColor};
  border-radius: var(--border-radius-md);
  font: 11px/11px 'Proxima Nova Semibold';
  color: white;
  padding: 2px 6px 3px 6px;
  vertical-align: baseline;
  white-space: nowrap;
`
