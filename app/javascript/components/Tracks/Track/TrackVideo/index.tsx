import React from 'react'
import { Route, Switch, match } from 'react-router-dom'

import { useTrackQuery } from 'api/tracks'
import VideoSettings from './VideoSettings'
import VideoPlayer from './VideoPlayer'

type TrackVideoProps = {
  match: match<{ id: string }>
}

const TrackVideo = ({ match }: TrackVideoProps): JSX.Element => {
  const trackId = Number(match.params.id)
  const { data: track } = useTrackQuery(trackId)

  return (
    <Switch>
      <Route exact path={`${match.path}`}>
        <VideoPlayer trackId={trackId} />
      </Route>
      {track?.permissions?.canEdit && (
        <Route path={`${match.path}/edit`}>
          <VideoSettings trackId={trackId} />
        </Route>
      )}
    </Switch>
  )
}

export default TrackVideo
