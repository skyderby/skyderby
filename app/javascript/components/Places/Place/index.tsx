import React from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'

import { usePlaceQuery } from 'api/places'
import Loading from 'components/LoadingSpinner'
import Header from './Header'
import Overview from './Overview'
import Videos from './Videos'
import Tracks from './Tracks'
import Edit from './Edit'
import styles from './styles.module.scss'
import ErrorPage from 'components/ErrorPage'

const Place = () => {
  const params = useParams()
  const id = Number(params.id)
  const { data: place, isLoading, isError, error } = usePlaceQuery(id)

  if (isLoading) return <Loading />
  if (isError) return ErrorPage.forError(error, { linkBack: '/tracks' })
  if (!place) return null

  return (
    <div className={styles.container}>
      <Header place={place} />

      <Routes>
        <Route index element={<Overview placeId={id} />} />
        <Route path="videos" element={<Videos placeId={id} />} />
        <Route path="tracks" element={<Tracks placeId={id} />} />
        {place.permissions.canEdit && (
          <Route path="edit" element={<Edit placeId={id} />} />
        )}

        <Route path="*" element={<Navigate replace to={`/places/${id}`} />} />
      </Routes>
    </div>
  )
}

export default Place
