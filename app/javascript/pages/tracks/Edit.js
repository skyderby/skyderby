import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'

import TrackEdit from 'components/TrackEdit'
import ErrorPlaceholder from 'components/ErrorPlaceholder'
import PrimaryButton from 'components/ui/buttons/Primary'
import { PageContext } from 'components/PageContext'
import { loadTrack, createTrackSelector } from 'redux/tracks'

const Edit = ({ match, location: { state: locationState } }) => {
  const [pageStatus, setPageStatus] = useState('loading')
  const dispatch = useDispatch()
  const trackId = Number(match.params.id)
  const track = useSelector(createTrackSelector(trackId))

  useEffect(() => {
    dispatch(loadTrack(trackId))
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

  if (pageStatus === 'ClientError') return <Redirect to="/tracks" />

  if (pageStatus === 'ServerError') {
    return (
      <ErrorPlaceholder title="500" description="Server error">
        <PrimaryButton as={Link} to="/tracks">
          Go back
        </PrimaryButton>
      </ErrorPlaceholder>
    )
  }

  if (track?.editable === false) return <Redirect to="/tracks" />

  return (
    <PageContext value={{ trackId, locationState }}>
      <TrackEdit />
    </PageContext>
  )
}

Edit.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  location: PropTypes.shape({
    state: PropTypes.object
  }).isRequired
}

export default Edit
