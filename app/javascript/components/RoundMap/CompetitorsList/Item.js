import { h } from 'preact'
import styled from 'styled-components'

import Direction from './Direction'
import Mark from './Mark'
import PenaltyLabel from './PenaltyLabel'
import ExitAltitude from './ExitAltitude'
import ReferencePoint from './ReferencePoint'

const Item = ({ className, ...props }) => {
  const {
    name,
    direction,
    exitAltitude,
    penalized,
    penaltySize,
    referencePoint,
    color
  } = props

  const handleShowDL = e => {
    console.log(e)
  }
  console.log(props)

  return (
    <div className={className}>
      <Row>
        <Mark color={color} />
        <span>{name}</span>
        <PenaltyLabel penalized={penalized} penaltySize={penaltySize} />
        <ReferencePoint referencePoint={referencePoint} />
      </Row>
      <Row>
        <ShowDLButton onClick={handleShowDL}>Show DL</ShowDLButton>
        <AdditionalInfo>
          <Direction direction={direction} />
          <ExitAltitude altitude={exitAltitude} />
        </AdditionalInfo>
      </Row>
    </div>
  )
}

const ShowDLButton = styled.button`
  font-size: 12px;
  border: none;
  padding: 0;
`

const Row = styled.div`
  align-items: baseline;
  display: flex;
  margin-bottom: 5px;

  > * {
    margin-right: 5px;
  }
`

const AdditionalInfo = styled.div`
  margin-left: auto;
  color: #777;
  font-family: 'Proxima Nova Regular';
  font-size: 12px;
`

export default styled(Item)`
  font-family: 'Proxima Nova Regular';
  padding: 5px 7px;
`
