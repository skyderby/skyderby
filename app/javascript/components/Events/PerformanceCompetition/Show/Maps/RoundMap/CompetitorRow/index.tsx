import React, { useState } from 'react'

import { useI18n } from 'components/TranslationsProvider'
import { Competitor, Result } from 'api/performanceCompetitions'
import { useProfileQuery } from 'api/profiles'
import Mark from './Mark'
import PenaltyLabel from './PenaltyLabel'
import ExitAltitude from './ExitAltitude'
import ReferencePoint from './ReferencePoint'
import styles from './styles.module.scss'
import Direction from 'components/Events/PerformanceCompetition/Show/Maps/RoundMap/CompetitorRow/Direction'

type WithResultProps = {
  competitor: Competitor & { result: Result}
  checked: boolean
  color: string
  onToggle: () => unknown
  onToggleDL: () => unknown
}

const WithResult = ({ competitor, checked, color, onToggle: handleToggle, onToggleDL: handleShowDL }: WithResultProps) => {
  const { t: _t } = useI18n()
  const [_showPenaltyModal, setShowPenaltyModal] = useState(false)
  const { data: profile } = useProfileQuery(competitor.profileId)

  const result = competitor.result

  // const modalTitle = `${name} | ${t('disciplines.' + discipline)} - ${number}`
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
          <PenaltyLabel penalized={result.penalized} penaltySize={result.penaltySize} />
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
          <Direction direction={result.headingWithinWindow} />
          <ExitAltitude altitude={result.exitAltitude} />
        </div>
      </div>
    </div>
  )
}

type WithoutResultProps = {
  competitor: Competitor
}

const WithoutResult = ({ competitor }: WithoutResultProps) => {
  const { data: profile } = useProfileQuery(competitor.profileId)

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <label className={styles.label}>
          <Mark />
          <span className={styles.name}>{profile?.name}</span>
        </label>
      </div>
    </div>
  )
}

export default Object.assign({}, { WithResult, WithoutResult })
