import React, { useState } from 'react'
import cx from 'clsx'

import { useI18n } from 'components/TranslationsProvider'
import CogIcon from 'icons/cog.svg'
import SettingsModal from './SettingsModal'
import styles from './styles.module.scss'
import { useTrackViewPreferences, ViewPreferences } from 'components/TrackViewPreferences'

type ViewSettingsProps = {
  straightLine: boolean
  setStraightLine: (val: boolean) => void
}

const ViewSettings = ({
  straightLine,
  setStraightLine
}: ViewSettingsProps): JSX.Element => {
  const { t } = useI18n()
  const { viewPreferences, setViewPreferences } = useTrackViewPreferences()
  const [showModal, setShowModal] = useState(false)

  const handleSave = (values: ViewPreferences) => {
    setViewPreferences(values)
    setShowModal(false)
  }

  return (
    <div className={styles.container}>
      <button
        className={cx(styles.flatButton, straightLine && styles.buttonActive)}
        onClick={() => setStraightLine(!straightLine)}
      >
        Straight line
      </button>

      <button className={styles.flatButton} onClick={() => setShowModal(true)}>
        <CogIcon />
        <span>{t('general.settings')}</span>
      </button>

      <SettingsModal
        isShown={showModal}
        formValues={viewPreferences}
        onSubmit={handleSave}
        onHide={() => setShowModal(false)}
      />
    </div>
  )
}

export default ViewSettings
