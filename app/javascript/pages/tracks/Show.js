import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { PageContext } from 'components/PageContext'
import TrackShow from 'components/TrackShow'
import { loadTrack } from 'redux/tracks'
import { loadTrackPoints } from 'redux/tracks/points'
import { loadTrackWindData } from 'redux/tracks/windData'
import { loadTrackVideo } from 'redux/tracks/videos'

const Show = ({ match }) => {
  const dispatch = useDispatch()
  const trackId = Number(match.params.id)
  const urlParams = Object.fromEntries(new URLSearchParams(useLocation().search))

  const altitudeFrom = urlParams.f && Number(urlParams.f)
  const altitudeTo = urlParams.t && Number(urlParams.t)
  const straightLine = urlParams['straight-line'] === 'true'

  useEffect(() => {
    dispatch(loadTrack(trackId)).then(() => {
      dispatch(loadTrackPoints(trackId))
      dispatch(loadTrackWindData(trackId))
      dispatch(loadTrackVideo(trackId))
    })
  }, [dispatch, trackId])

  return (
    <PageContext value={{ trackId, altitudeFrom, altitudeTo, straightLine }}>
      <TrackShow />
    </PageContext>
  )
}

Show.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default Show
