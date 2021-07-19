import React from 'react'
import { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import { usePlaceQuery } from 'api/hooks/places'
import { useEditPlaceMutation } from 'api/hooks/places'
import Form from '../../Form'
import styles from './styles.module.scss'

const Edit = ({ match }) => {
  const editPlaceMutation = useEditPlaceMutation()
  const id = Number(match.params.id)
  const { data: place } = usePlaceQuery(id)
  const history = useHistory()
  const { t } = useI18n()

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
      <Helmet>
        <title>{`${t('places.title')} | ${t('places.edit')}`}</title>
        <meta name="description" content={t('places.description')} />
      </Helmet>
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
