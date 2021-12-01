import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

import PlacesIndex from 'components/Places/PlacesIndex'
import Place from 'components/Places/Place'
import NewPlace from './NewPlace'
import Loading from 'components/PageWrapper/Loading'
import { useCurrentUserQuery } from 'api/sessions'

const Places = () => {
  const { data: currentUser, isLoading } = useCurrentUserQuery()
  const canCreatePlace = currentUser?.permissions.canCreatePlace

  if (isLoading) return <Loading />

  return (
    <Routes>
      <Route index element={<PlacesIndex />} />
      <Route path=":id/*" element={<Place />} />
      {canCreatePlace && <Route path="new" element={<NewPlace />} />}
      <Route render={() => <Navigate to="/places" />} />
    </Routes>
  )
}

export default Places
