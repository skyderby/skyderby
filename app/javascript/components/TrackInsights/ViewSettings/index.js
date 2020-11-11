import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import { selectUserPreferences, updatePreferences } from 'redux/userPreferences'
import FlatButton from 'components/ui/FlatButton'
import CogIcon from 'icons/cog.svg'
import SettingsModal from './SettingsModal'

import styles from './styles.module.scss'

const ViewSettings = ({ straightLine, setStraightLine }) => {
  const { t } = useI18n()
  const dispatch = useDispatch()
  const [showModal, setShowModal] = useState(false)

  const { chartMode, unitSystem } = useSelector(selectUserPreferences)

  const handleSave = values => {
    dispatch(updatePreferences(values))
    setShowModal(false)
  }

  return (
    <div className={styles.container}>
      <FlatButton active={straightLine} onClick={() => setStraightLine(!straightLine)}>
        Straight line
      </FlatButton>
      <FlatButton onClick={() => setShowModal(true)}>
        <CogIcon />
        <span>{t('general.settings')}</span>
      </FlatButton>

      <SettingsModal
        isShown={showModal}
        formValues={{ chartMode, unitSystem }}
        onSubmit={handleSave}
        onHide={() => setShowModal(false)}
      />
    </div>
  )
}

ViewSettings.propTypes = {
  straightLine: PropTypes.bool.isRequired,
  setStraightLine: PropTypes.func.isRequired
}

export default ViewSettings
