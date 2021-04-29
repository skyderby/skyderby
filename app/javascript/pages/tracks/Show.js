import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'

import { useTrackQuery } from 'api/hooks/tracks'
import AppShell from 'components/AppShell'
import PageWrapper from 'components/PageWrapper'
import TrackShow from 'components/TrackShow'
import TrackInsights from 'components/TrackInsights'
import TrackMap from 'components/TrackMap'
import TrackGlobe from 'components/TrackGlobe'
import TrackWindData from 'components/TrackWindData'
import TrackResults from 'components/TrackResults'
import TrackVideo from 'components/TrackVideo'
import TrackVideoForm from 'components/TrackVideoForm'
import TrackEdit from 'components/TrackEdit'

const Show = ({ match }) => {
  const trackId = Number(match.params.id)

  const { data: track, isLoading, status, error } = useTrackQuery(trackId, {
    preload: ['points', 'windData', 'video']
  })

  return (
    <AppShell>
      <PageWrapper status={status} error={error}>
        {!isLoading && (
          <TrackShow track={track}>
            <Switch>
              <Route path="/tracks/:id" exact component={TrackInsights} />
              <Route path="/tracks/:id/map" component={TrackMap} />
              <Route path="/tracks/:id/globe" component={TrackGlobe} />
              <Route path="/tracks/:id/wind_data" component={TrackWindData} />
              <Route path="/tracks/:id/results" component={TrackResults} />
              {track.hasVideo && (
                <Route path="/tracks/:id/video" exact component={TrackVideo} />
              )}

              {track.permissions.canEdit && (
                <>
                  <Route path="/tracks/:id/edit" component={TrackEdit} />
                  <Route path="/tracks/:id/video/edit" component={TrackVideoForm} />
                </>
              )}

              <Route component={() => <Redirect to={`/tracks/${track.id}`} />} />
            </Switch>
          </TrackShow>
        )}
      </PageWrapper>
    </AppShell>
  )
}

Show.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
    state: PropTypes.object
  }).isRequired
}

export default Show
