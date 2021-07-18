import React from 'react'
import PropTypes from 'prop-types'

import { usePlaceQuery } from 'api/hooks/places'
import { useEditPlaceMutation } from 'api/hooks/places'
import { useHistory } from 'react-router-dom'
import Form from '../../Form'
import styles from './styles.module.scss'
import { useCallback } from 'react'

const Edit = ({ match }) => {
  const editPlaceMutation = useEditPlaceMutation()
  const id = Number(match.params.id)
  const { data: place } = usePlaceQuery(id)
  const history = useHistory()

  const updateEvent = useCallback(
    async values => {
      try {
        const { data: place } = await editPlaceMutation.mutateAsync(values)
        history.push(`/places/${place.id}`)
      } catch (err) {
        console.warn(err.message)
      }
    },
    [editPlaceMutation, history]
  )

  return (
    <div className={styles.containeredit}>
      <div className={styles.card}>
        <Form initialValues={place} onSubmit={updateEvent} />
      </div>
    </div>
  )
}

Edit.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default Edit
