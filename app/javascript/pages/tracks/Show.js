import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { PageContext } from 'components/PageContext'
import { loadTrack } from 'redux/tracks'
import { loadTrackPoints } from 'redux/tracks/points'
import { loadTrackWindData } from 'redux/tracks/windData'
import { loadTrackVideo } from 'redux/tracks/videos'
import usePageStatus from 'hooks/usePageStatus'
import PageWrapper from 'components/PageWrapper'
import TrackShow from 'components/TrackShow'

const Show = ({ match, location: { search, state: locationState } }) => {
  const dispatch = useDispatch()
  const trackId = Number(match.params.id)
  const urlParams = Object.fromEntries(new URLSearchParams(search))
  const [status, { onLoadStart, onLoadSuccess, onError }] = usePageStatus({
    linkBack: '/tracks'
  })

  const altitudeFrom = urlParams.f && Number(urlParams.f)
  const altitudeTo = urlParams.t && Number(urlParams.t)
  const straightLine = urlParams['straight-line'] === 'true'

  useEffect(() => {
    onLoadStart()
    dispatch(loadTrack(trackId))
      .then(() =>
        Promise.all([
          dispatch(loadTrackPoints(trackId)),
          dispatch(loadTrackWindData(trackId)),
          dispatch(loadTrackVideo(trackId))
        ])
      )
      .then(onLoadSuccess)
      .catch(onError)
  }, [dispatch, trackId, onLoadStart, onLoadSuccess, onError])

  return (
    <PageWrapper {...status}>
      <PageContext
        value={{ trackId, altitudeFrom, altitudeTo, straightLine, locationState }}
      >
        <TrackShow />
      </PageContext>
    </PageWrapper>
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
