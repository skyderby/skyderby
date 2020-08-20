import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { PageContext } from 'components/PageContext'
import TrackShow from 'components/TrackShow'
import ErrorPlaceholder from 'components/ErrorPlaceholder'
import PrimaryButton from 'components/ui/buttons/Primary'
import { loadTrack } from 'redux/tracks'
import { loadTrackPoints } from 'redux/tracks/points'
import { loadTrackWindData } from 'redux/tracks/windData'
import { loadTrackVideo } from 'redux/tracks/videos'

const Show = ({ match, location: { search, state: locationState } }) => {
  const [pageStatus, setPageStatus] = useState('loading')
  const dispatch = useDispatch()
  const trackId = Number(match.params.id)
  const urlParams = Object.fromEntries(new URLSearchParams(search))

  const altitudeFrom = urlParams.f && Number(urlParams.f)
  const altitudeTo = urlParams.t && Number(urlParams.t)
  const straightLine = urlParams['straight-line'] === 'true'

  useEffect(() => {
    dispatch(loadTrack(trackId))
      .then(() => {
        dispatch(loadTrackPoints(trackId))
        dispatch(loadTrackWindData(trackId))
        dispatch(loadTrackVideo(trackId))
      })
      .then(() => setPageStatus('loaded'))
      .catch(err => {
        if (Math.floor(err.response.status / 100) === 4) {
          setPageStatus('ClientError')
        } else {
          setPageStatus('ServerError')
        }
      })
  }, [dispatch, trackId])

  if (pageStatus === 'loading') return null

  if (pageStatus === 'ClientError') {
    return (
      <ErrorPlaceholder title="404" description="Track you're looking for not found">
        <PrimaryButton as={Link} to="/tracks">
          Go back
        </PrimaryButton>
      </ErrorPlaceholder>
    )
  }

  if (pageStatus === 'ServerError') {
    return (
      <ErrorPlaceholder title="500" description="Server error">
        <PrimaryButton as={Link} to="/tracks">
          Go back
        </PrimaryButton>
      </ErrorPlaceholder>
    )
  }

  return (
    <PageContext
      value={{ trackId, altitudeFrom, altitudeTo, straightLine, locationState }}
    >
      <TrackShow />
    </PageContext>
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
