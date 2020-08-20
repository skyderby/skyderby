import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import I18n from 'i18n-js'
import PropTypes from 'prop-types'

import { updatePreferences } from 'redux/userPreferences'
import FlatButton from 'components/ui/FlatButton'
import CogIcon from 'icons/cog.svg'
import SettingsModal from './SettingsModal'
import { Container } from './elements'

const ViewSettings = ({ straightLine, setStraightLine }) => {
  const dispatch = useDispatch()
  const [showModal, setShowModal] = useState(false)

  const { chartMode, unitSystem } = useSelector(state => state.userPreferences)

  const handleSave = values => {
    dispatch(updatePreferences(values))
    setShowModal(false)
  }

  return (
    <Container>
      <FlatButton active={straightLine} onClick={() => setStraightLine(!straightLine)}>
        Straight line
      </FlatButton>
      <FlatButton onClick={() => setShowModal(true)}>
        <CogIcon />
        <span>{I18n.t('general.settings')}</span>
      </FlatButton>

      <SettingsModal
        isShown={showModal}
        formValues={{ chartMode, unitSystem }}
        onSubmit={handleSave}
        onHide={() => setShowModal(false)}
      />
    </Container>
  )
}

ViewSettings.propTypes = {
  straightLine: PropTypes.bool.isRequired,
  setStraightLine: PropTypes.func.isRequired
}

export default ViewSettings
