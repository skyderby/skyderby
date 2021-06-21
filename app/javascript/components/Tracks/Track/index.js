import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import PropTypes from 'prop-types'

import { useTrackQuery } from 'api/hooks/tracks'
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

const Track = ({ match }) => {
  const trackId = Number(match.params.id)

  const { data: track, isLoading } = useTrackQuery(trackId, {
    preload: ['points', 'windData', 'video']
  })

  return (
    <AppShell>
      {isLoading ? (
        <Loading />
      ) : (
        <div className={styles.container}>
          <Header track={track} />

          <Switch>
            <Route exact path={match.path}>
              <TrackInsights trackId={trackId} />
            </Route>
            <Route path={`${match.path}/map`}>
              <TrackMap trackId={trackId} />
            </Route>
            <Route path={`${match.path}/globe`}>
              <TrackGlobe trackId={trackId} />
            </Route>
            <Route path={`${match.path}/wind_data`}>
              <TrackWindData trackId={trackId} />
            </Route>
            <Route path={`${match.path}/results`}>
              <TrackResults trackId={trackId} />
            </Route>
            {(track.hasVideo || track.permissions.canEdit) && (
              <Route path={`${match.path}/video`}>
                <TrackVideo trackId={trackId} />
              </Route>
            )}
            {track.permissions.canEdit && (
              <Route path={`${match.path}/edit`}>
                <TrackEdit trackId={trackId} />
              </Route>
            )}

            <Route component={() => <Redirect to={`/tracks/${track.id}`} />} />
          </Switch>
        </div>
      )}
    </AppShell>
  )
}

Track.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired,
    path: PropTypes.string.isRequired
  }).isRequired
}

export default Track
