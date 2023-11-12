import React, { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'

import { useTrackQuery } from 'api/tracks'
import { preloadPoints } from 'api/tracks/points'
import { preloadWindData } from 'api/tracks/windData'
import Loading from 'components/LoadingSpinner'
import Header from './Header'
import TrackInsights from './TrackInsights'
import TrackMap from './TrackMap'
import TrackGlobe from './TrackGlobe'
import TrackWindData from './TrackWindData'
import TrackResults from './TrackResults'
import TrackVideo from './TrackVideo'
import TrackVideoSettings from './TrackVideoSettings'
import TrackEdit from './TrackEdit'
import styles from './styles.module.scss'
import ErrorPage from 'components/ErrorPage'

const Track = (): JSX.Element | null => {
  const params = useParams()
  const trackId = Number(params.id)
  const queryClient = useQueryClient()
  const { data: track, isLoading, isError, error } = useTrackQuery(trackId)

  useEffect(() => {
    if (isLoading || isError) return

    preloadPoints(queryClient, trackId)
    preloadWindData(queryClient, trackId)
  }, [trackId, queryClient, isLoading, isError])

  if (isLoading) return <Loading />
  if (isError) return ErrorPage.forError(error, { linkBack: '/tracks' })
  if (!track) return null // hard to imagine when isLoading and isError false and track is not there

  return (
    <div className={styles.container}>
      <Header track={track} />

      <Routes>
        <Route index element={<TrackInsights trackId={trackId} />} />
        <Route path="map" element={<TrackMap trackId={trackId} />} />
        <Route path="globe" element={<TrackGlobe trackId={trackId} />} />
        <Route path="wind_data" element={<TrackWindData trackId={trackId} />} />
        <Route path="results" element={<TrackResults trackId={trackId} />} />
        {track.hasVideo && (
          <Route path="video" element={<TrackVideo trackId={trackId} />} />
        )}
        {!track.hasVideo && track?.permissions.canEdit && (
          <Route
            path="video"
            element={<Navigate to={`/tracks/${trackId}/video/edit`} />}
          />
        )}
        {track.permissions.canEdit && (
          <>
            <Route path="edit" element={<TrackEdit trackId={trackId} />} />
            <Route path="video/edit" element={<TrackVideoSettings trackId={trackId} />} />
          </>
        )}

        <Route path="*" element={<Navigate to={`/tracks/${trackId}`} />} />
      </Routes>
    </div>
  )
}

export default Track
