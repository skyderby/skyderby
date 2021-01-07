import React from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'

import Modal from 'components/ui/Modal'
import { usePageContext } from 'components/PageContext'
import { createTeam } from 'redux/events/teams'

import Form from './Form'

const initialValues = {
  name: '',
  competitorIds: []
}

const NewTeamModal = ({ isShown, onHide }) => {
  const dispatch = useDispatch()
  const { eventId } = usePageContext()

  const handleSubmit = async values => {
    await dispatch(createTeam(eventId, values))
    onHide()
  }

  return (
    <Modal size="sm" isShown={isShown} onHide={onHide} title="New team">
      <Form initialValues={initialValues} onSubmit={handleSubmit} onCancel={onHide} />
    </Modal>
  )
}

NewTeamModal.propTypes = {
  isShown: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired
}
export default NewTeamModal
