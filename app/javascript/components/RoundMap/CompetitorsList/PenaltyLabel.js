import { h } from 'preact'
import styled from 'styled-components'

const defaultPenaltyColor = '#f0ad4e'
const majorPenaltyColor = '#d9534f'

const PenaltyLabel = ({ className, penalized, penaltySize }) => {
  if (!penalized) return null

  return <span className={className}>-{penaltySize}%</span>
}

export default styled(PenaltyLabel)`
  align-self: center;
  background-color: ${props =>
    Number(props.penaltySize) <= 20 ? defaultPenaltyColor : majorPenaltyColor};
  border-radius: 3px;
  font: 11px/11px 'Proxima Nova Semibold';
  color: white;
  padding: 2px 6px 3px 6px;
  vertical-align: baseline;
  white-space: nowrap;
`

