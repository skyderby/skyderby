import React from 'react'
import { useNavigate } from 'react-router-dom'

import Form from '../Form'
import styles from './styles.module.scss'
import { useNewPlaceMutation } from 'api/places'
import { useI18n } from 'components/TranslationsProvider'

const NewPlace = () => {
  const newPlaceMutation = useNewPlaceMutation()
  const navigate = useNavigate()

  const createEvent = async values => {
    try {
      const { data: place } = await newPlaceMutation.mutateAsync(values)
      navigate(`/places/${place.id}`)
    } catch (err) {
      console.warn(err.message)
    }
  }

  const initialValues = {
    countryId: null,
    kind: 'skydive',
    name: '',
    latitude: 0,
    longitude: 0,
    msl: 0
  }

  const { t } = useI18n()

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>{t('views.places.title')}</h1>
      <div className={styles.card}>
        <Form initialValues={initialValues} onSubmit={createEvent} />
      </div>
    </div>
  )
}

export default NewPlace
