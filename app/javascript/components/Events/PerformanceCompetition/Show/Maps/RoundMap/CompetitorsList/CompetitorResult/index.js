import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { showDlForResult } from 'redux/events/round'
import { useI18n } from 'components/TranslationsProvider'

import Mark from './Mark'
import PenaltyLabel from './PenaltyLabel'
import ExitAltitude from './ExitAltitude'
import ReferencePoint from '../ReferencePoint'

import styles from './styles.module.scss'
import { useProfileQuery } from 'api/profiles'

const CompetitorResult = ({ competitor, checked, color, onToggle: handleToggle }) => {
  const { t: _t } = useI18n()
  const dispatch = useDispatch()
  const [_showPenaltyModal, setShowPenaltyModal] = useState(false)
  const { data: profile } = useProfileQuery(competitor.profileId)

  const result = competitor.result

  // const modalTitle = `${name} | ${t('disciplines.' + discipline)} - ${number}`
  const handleShowDL = () => dispatch(showDlForResult(competitor))
  const handleShowPenaltyModal = () => setShowPenaltyModal(true)
  // const onModalHide = () => setShowPenaltyModal(false)

  return (
    <div className={styles.container}>
      {/*<PenaltyForm*/}
      {/*  title={modalTitle}*/}
      {/*  resultId={competitor}*/}
      {/*  isShown={showPenaltyModal}*/}
      {/*  onModalHide={onModalHide}*/}
      {/*  onComplete={onModalHide}*/}
      {/*/>*/}

      <div className={styles.row}>
        <label className={styles.label}>
          <input type="checkbox" checked={checked} onChange={handleToggle} />
          <Mark color={result && color} />
          <span className={styles.name}>{profile?.name}</span>
          {result && (
            <PenaltyLabel penalized={result.penalized} penaltySize={result.penaltySize} />
          )}
        </label>

        <ReferencePoint competitorId={competitor.id} />
      </div>

      <div className={styles.row}>
        <button className={styles.flatButton} onClick={handleShowDL}>
          Show DL
        </button>
        <button className={styles.flatButton} onClick={handleShowPenaltyModal}>
          Penalties
        </button>

        <div className={styles.additionalInfo}>
          {result && <ExitAltitude altitude={result.exitAltitude} />}
        </div>
      </div>
    </div>
  )
}

CompetitorResult.propTypes = {
  competitor: PropTypes.shape({
    id: PropTypes.number.isRequired,
    profileId: PropTypes.number.isRequired,
    result: PropTypes.shape({
      exitAltitude: PropTypes.number.isRequired,
      penalized: PropTypes.bool.isRequired,
      penaltySize: PropTypes.number
    })
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  checked: PropTypes.bool.isRequired,
  color: PropTypes.string.isRequired
}

export default CompetitorResult
