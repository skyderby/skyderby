import React from 'react'
import { useNavigate } from 'react-router-dom'

import Form from '../Form'
import styles from './styles.module.scss'
import { PlaceVariables, useCreatePlaceMutation } from 'api/places'
import { useI18n } from 'components/TranslationsProvider'
import { useCurrentUserQuery } from 'api/sessions'
import Loading from 'components/LoadingSpinner'

const initialValues: PlaceVariables = {
  countryId: null,
  kind: 'skydive',
  name: '',
  latitude: null,
  longitude: null,
  msl: null
}

const NewPlace = () => {
  const { t } = useI18n()
  const { data: currentUser, isLoading } = useCurrentUserQuery()
  const mutation = useCreatePlaceMutation()
  const navigate = useNavigate()

  if (isLoading) return <Loading />

  if (!currentUser?.permissions.canCreatePlace) navigate('/places')

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>{t('views.places.title')}</h1>
      <div className={styles.card}>
        <Form initialValues={initialValues} mutation={mutation} returnUrl="/places" />
      </div>
    </div>
  )
}

export default NewPlace
