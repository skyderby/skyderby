import React from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import PropTypes from 'prop-types'

import { useTrackQuery } from 'api/hooks/tracks'
import VideoSettings from './VideoSettings'
import VideoPlayer from './VideoPlayer'

const TrackVideo = ({ trackId }) => {
  const match = useRouteMatch()
  const { data: track } = useTrackQuery(trackId)

  return (
    <Switch>
      <Route exact path={`${match.path}`}>
        <VideoPlayer trackId={trackId} />
      </Route>
      {track.permissions.canEdit && (
        <Route path={`${match.path}/edit`}>
          <VideoSettings trackId={trackId} />
        </Route>
      )}
    </Switch>
  )
}

TrackVideo.propTypes = {
  trackId: PropTypes.number.isRequired
}
export default TrackVideo
