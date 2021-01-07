import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import Modal from 'components/ui/Modal'
import { usePageContext } from 'components/PageContext'
import { selectTeam } from 'redux/events/teams/selectors'
import { updateTeam, deleteTeam } from 'redux/events/teams'

import Form from './Form'

const EditTeamModal = ({ id, isShown, onHide }) => {
  const dispatch = useDispatch()
  const team = useSelector(state => selectTeam(id, state))
  const { eventId } = usePageContext()

  const handleSubmit = async values => {
    await dispatch(updateTeam(eventId, id, values))
    onHide()
  }

  const handleDelete = async () => {
    await dispatch(deleteTeam(eventId, id))
  }

  return (
    <Modal size="sm" isShown={isShown} onHide={onHide} title="Edit team">
      <Form
        isDeletable
        initialValues={team}
        onSubmit={handleSubmit}
        onCancel={onHide}
        onDelete={handleDelete}
      />
    </Modal>
  )
}

EditTeamModal.propTypes = {
  id: PropTypes.number.isRequired,
  isShown: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired
}

export default EditTeamModal
