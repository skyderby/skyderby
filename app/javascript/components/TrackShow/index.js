import React from 'react'
import { useSelector } from 'react-redux'
import { Switch, Route } from 'react-router-dom'

import { selectTrack } from 'redux/tracks'
import { usePageContext } from 'components/PageContext'
import TrackInsights from 'components/TrackInsights'
import TrackMap from 'components/TrackMap'
import TrackGlobe from 'components/TrackGlobe'
import TrackVideo from 'components/TrackVideo'
import TrackWindData from 'components/TrackWindData'
import TrackResults from 'components/TrackResults'

import Header from './Header'
import Navbar from './Navbar'
import { Container } from './elements'

const TrackShow = () => {
  const { trackId } = usePageContext()

  const track = useSelector(state => selectTrack(state, trackId))

  if (!track || track.status === 'loading') return null

  return (
    <Container>
      <Header track={track} />
      <Navbar track={track} />
      <Switch>
        <Route exact path="/tracks/:id" component={TrackInsights} />
        <Route path="/tracks/:id/map" component={TrackMap} />
        <Route path="/tracks/:id/globe" component={TrackGlobe} />
        <Route path="/tracks/:id/video" component={TrackVideo} />
        <Route path="/tracks/:id/wind_data" component={TrackWindData} />
        <Route path="/tracks/:id/results" component={TrackResults} />
      </Switch>
    </Container>
  )
}

export default TrackShow
