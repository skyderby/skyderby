import React, { useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { toggleResult } from 'redux/events/roundMap'
import Modal from 'components/ui/Modal'

import Direction from './Direction'
import Mark from './Mark'
import Name from './Name'
import PenaltyLabel from './PenaltyLabel'
import ExitAltitude from './ExitAltitude'
import ReferencePoint from '../ReferencePoint'
import FlatButton from 'components/ui/FlatButton'

const CompetitorResult = ({ className, resultId }) => {
  const dispatch = useDispatch()
  const [showPenaltyModal, setShowPenaltyModal] = useState(false)

  const {
    name,
    competitorId,
    direction,
    exitAltitude,
    penalized,
    penaltySize,
    color
  } = useSelector(state => state.eventRoundMap.results.find(el => el.id === resultId))

  const checked = useSelector(
    state => state.eventRoundMap.selectedResults.find(el => el === resultId) !== undefined
  )

  const handleSelect = () => dispatch(toggleResult(resultId))
  const handleShowDL = () => dispatch(() => resultId)
  const handleShowPenaltyModal = () => setShowPenaltyModal(true)
  const onModalHide = () => setShowPenaltyModal(false)

  return (
    <div className={className}>
      <Modal isShown={showPenaltyModal} onHide={onModalHide} />

      <Row>
        <Label>
          <input type="checkbox" checked={checked} onChange={handleSelect} />
          <Mark color={color} />
          <Name>{name}</Name>
          <PenaltyLabel penalized={penalized} penaltySize={penaltySize} />
        </Label>

        <ReferencePoint competitorId={competitorId} />
      </Row>

      <Row>
        <FlatButton onClick={handleShowDL}>Show DL</FlatButton>
        <FlatButton onClick={handleShowPenaltyModal}>Penalties</FlatButton>

        <AdditionalInfo>
          <Direction direction={direction} />
          <ExitAltitude altitude={exitAltitude} />
        </AdditionalInfo>
      </Row>
    </div>
  )
}

const Row = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 5px;
`

const Label = styled.label`
  display: flex;
  align-items: center;
  flex-basis: 80%;
  flex-shrink: 1;
  flex-grow: 1;
  min-width: 0;
  margin-bottom: 0;

  input[type='checkbox'] {
    margin: 0 5px 0 0;
  }

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

export default styled(CompetitorResult)`
  font-family: 'Proxima Nova Regular';
  padding: 5px 7px;
`
