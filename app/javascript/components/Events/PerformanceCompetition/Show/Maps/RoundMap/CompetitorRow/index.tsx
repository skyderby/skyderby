import React, { useState } from 'react'
import cx from 'clsx'

import { useI18n } from 'components/TranslationsProvider'
import type {
  Competitor,
  Result,
  ReferencePoint as ReferencePointType,
  PerformanceCompetition
} from 'api/performanceCompetitions'
import { useProfileQuery } from 'api/profiles'
import Mark from './Mark'
import PenaltyLabel from './PenaltyLabel'
import ExitAltitude from './ExitAltitude'
import Direction from './Direction'
import ReferencePoint from './ReferencePoint'
import styles from './styles.module.scss'
import useResultPoints from 'components/Events/PerformanceCompetition/useResultPoints'

type WithResultProps = {
  event: PerformanceCompetition
  competitor: Competitor & { result: Result } & {
    referencePoint: ReferencePointType | null
  } & { color: string }
  checked: boolean
  onToggle: () => unknown
  onToggleDL: () => unknown
}

const WithResult = ({
  event,
  competitor,
  checked,
  onToggle: handleToggle,
  onToggleDL: handleShowDL
}: WithResultProps) => {
  const { t: _t } = useI18n()
  const [_showPenaltyModal, setShowPenaltyModal] = useState(false)
  const { data: profile } = useProfileQuery(competitor.profileId)
  const { isLoading } = useResultPoints(event, competitor.result, {
    enabled: checked
  })

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
        <label className={cx(styles.label, styles.active)}>
          <input
            type="checkbox"
            checked={checked}
            onChange={handleToggle}
            disabled={isLoading}
          />
          <Mark color={competitor.color} />
          <span className={styles.name}>{profile?.name}</span>
          <PenaltyLabel penalized={result.penalized} penaltySize={result.penaltySize} />
        </label>

        <ReferencePoint event={event} roundId={result.roundId} competitor={competitor} />
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

const WithoutResult = ({ competitor }: { competitor: Competitor }) => {
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
