import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { toggleResult, showDlForResult } from 'redux/events/round'
import { useI18n } from 'components/TranslationsProvider'

import Direction from './Direction'
import Mark from './Mark'
import PenaltyLabel from './PenaltyLabel'
import ExitAltitude from './ExitAltitude'
import ReferencePoint from '../ReferencePoint'
import PenaltyForm from 'components/RoundMap/PenaltyForm'

import styles from './styles.module.scss'

const CompetitorResult = ({ resultId }) => {
  const { t } = useI18n()
  const dispatch = useDispatch()
  const [showPenaltyModal, setShowPenaltyModal] = useState(false)

  const { discipline, number } = useSelector(state => state.eventRound)
  const {
    name,
    competitorId,
    direction,
    exitAltitude,
    penalized,
    penaltySize,
    color
  } = useSelector(state => state.eventRound.results.find(el => el.id === resultId))

  const checked = useSelector(
    state => state.eventRound.selectedResults.find(el => el === resultId) !== undefined
  )

  const modalTitle = `${name} | ${t('disciplines.' + discipline)} - ${number}`
  const handleSelect = () => dispatch(toggleResult(resultId))
  const handleShowDL = () => dispatch(showDlForResult(resultId))
  const handleShowPenaltyModal = () => setShowPenaltyModal(true)
  const onModalHide = () => setShowPenaltyModal(false)

  return (
    <div className={styles.container}>
      <PenaltyForm
        title={modalTitle}
        resultId={resultId}
        isShown={showPenaltyModal}
        onModalHide={onModalHide}
        onComplete={onModalHide}
      />

      <div className={styles.row}>
        <label className={styles.label}>
          <input type="checkbox" checked={checked} onChange={handleSelect} />
          <Mark color={color} />
          <span className={styles.name}>{name}</span>
          <PenaltyLabel penalized={penalized} penaltySize={penaltySize} />
        </label>

        <ReferencePoint competitorId={competitorId} />
      </div>

      <div className={styles.row}>
        <button className={styles.flatButton} onClick={handleShowDL}>
          Show DL
        </button>
        <button className={styles.flatButton} onClick={handleShowPenaltyModal}>
          Penalties
        </button>

        <div className={styles.additionalInfo}>
          <Direction direction={direction} />
          <ExitAltitude altitude={exitAltitude} />
        </div>
      </div>
    </div>
  )
}

CompetitorResult.propTypes = {
  resultId: PropTypes.number.isRequired
}

export default CompetitorResult
