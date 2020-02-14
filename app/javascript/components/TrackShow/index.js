import React from 'react'
import { useSelector } from 'react-redux'
import { Switch, Route } from 'react-router-dom'

import { selectTrack } from 'redux/tracks'
import { usePageContext } from 'components/PageContext'
import TrackInsights from 'components/TrackInsights'
import Header from './Header'
import Navbar from './Navbar'
import { Container } from './elements'

const TrackShow = () => {
  const { trackId, altitudeFrom, altitudeTo, straightLine } = usePageContext()

  const track = useSelector(state => selectTrack(state, trackId))

  if (!track) return null

  return (
    <Container>
      <Header track={track} />
      <Navbar trackId={trackId} />
      <Switch>
        <Route
          exact
          path="/tracks/:id"
          component={() => (
            <TrackInsights
              trackId={trackId}
              altitudeFrom={altitudeFrom}
              altitudeTo={altitudeTo}
              straightLine={straightLine}
            />
          )}
        />
      </Switch>
    </Container>
  )
}

export default TrackShow
