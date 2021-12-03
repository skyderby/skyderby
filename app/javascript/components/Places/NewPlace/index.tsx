import React from 'react'
import { useNavigate } from 'react-router-dom'

import Form from '../Form'
import styles from './styles.module.scss'
import { CreateVariables, PlaceRecord, useNewPlaceMutation } from 'api/places'
import { useI18n } from 'components/TranslationsProvider'
import { useCurrentUserQuery } from 'api/sessions'
import Loading from 'components/PageWrapper/Loading'

const initialValues: CreateVariables = {
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
  const newPlaceMutation = useNewPlaceMutation({
    onSuccess: (place: PlaceRecord) => navigate(`/places/${place.id}`)
  })
  const navigate = useNavigate()

  if (isLoading) return <Loading />

  if (!currentUser?.permissions.canCreatePlace) navigate('/places')

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>{t('views.places.title')}</h1>
      <div className={styles.card}>
        <Form initialValues={initialValues} mutation={newPlaceMutation} />
      </div>
    </div>
  )
}

export default NewPlace
