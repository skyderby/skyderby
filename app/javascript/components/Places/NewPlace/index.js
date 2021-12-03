import React from 'react'
import { useNavigate } from 'react-router-dom'

import Form from '../Form'
import styles from './styles.module.scss'
import { useNewPlaceMutation } from 'api/places'
import { useI18n } from 'components/TranslationsProvider'
import { useCurrentUserQuery } from 'api/sessions'
import Loading from 'components/PageWrapper/Loading'

const initialValues = {
  countryId: null,
  kind: 'skydive',
  name: '',
  latitude: '',
  longitude: '',
  msl: ''
}

const NewPlace = () => {
  const { t } = useI18n()
  const { data: currentUser, isLoading } = useCurrentUserQuery()
  const newPlaceMutation = useNewPlaceMutation()
  const navigate = useNavigate()

  if (isLoading) return <Loading />

  if (!currentUser?.permissions.canCreatePlace) navigate('/places')

  const createEvent = async values => {
    try {
      const { data: place } = await newPlaceMutation.mutateAsync(values)
      navigate(`/places/${place.id}`)
    } catch (err) {
      console.warn(err.message)
    }
  }

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
