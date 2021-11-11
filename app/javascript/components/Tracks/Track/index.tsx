import React, { useEffect, useState } from 'react'
import { useQueryClient } from 'react-query'
import { Redirect, Route, Switch, match } from 'react-router-dom'

import { useTrackQuery } from 'api/tracks'
import { preloadPoints } from 'api/tracks/points'
import { preloadWindData } from 'api/tracks/windData'
import AppShell from 'components/AppShell'
import Loading from 'components/PageWrapper/Loading'
import Header from './Header'
import TrackInsights from './TrackInsights'
import TrackMap from './TrackMap'
import TrackGlobe from './TrackGlobe'
import TrackWindData from './TrackWindData'
import TrackResults from './TrackResults'
import TrackVideo from './TrackVideo'
import TrackEdit from './TrackEdit'
import styles from './styles.module.scss'

type TrackProps = {
  match: match<{ id: string }>
}

const Track = ({ match }: TrackProps): JSX.Element => {
  const trackId = Number(match.params.id)
  const queryClient = useQueryClient()
  const [isPointsLoading, setIsPointsLoading] = useState(true)
  const { data: track, isLoading: isTrackLoading } = useTrackQuery(trackId)

  const isLoading = isPointsLoading || isTrackLoading

  useEffect(() => {
    Promise.all([
      preloadPoints(queryClient, trackId),
      preloadWindData(queryClient, trackId)
    ]).then(() => setIsPointsLoading(false))
  }, [trackId, queryClient, setIsPointsLoading])

  return (
    <AppShell>
      {isLoading ? (
        <Loading />
      ) : (
        track && (
          <div className={styles.container}>
            <Header track={track} />

            <Switch>
              <Route exact path={match.path} component={TrackInsights} />
              <Route path={`${match.path}/map`} component={TrackMap} />
              <Route path={`${match.path}/globe`} component={TrackGlobe} />
              <Route path={`${match.path}/wind_data`} component={TrackWindData} />
              <Route path={`${match.path}/results`} component={TrackResults} />
              {(track.hasVideo || track.permissions.canEdit) && (
                <Route path={`${match.path}/video`} component={TrackVideo} />
              )}
              {track.permissions.canEdit && (
                <Route path={`${match.path}/edit`} component={TrackEdit} />
              )}

              <Route component={() => <Redirect to={`/tracks/${trackId}`} />} />
            </Switch>
          </div>
        )
      )}
    </AppShell>
  )
}

export default Track
