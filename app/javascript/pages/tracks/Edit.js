import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { ForbiddenError } from 'errors'
import usePageStatus from 'hooks/usePageStatus'
import PageWrapper from 'components/PageWrapper'
import TrackEdit from 'components/TrackEdit'
import { PageContext } from 'components/PageContext'
import { loadTrack } from 'redux/tracks'

const Edit = ({ match, location: { state: locationState } }) => {
  const dispatch = useDispatch()
  const trackId = Number(match.params.id)
  const [status, { onLoadStart, onLoadSuccess, onError }] = usePageStatus({
    linkBack: `/tracks/${trackId}`
  })

  useEffect(() => {
    onLoadStart()
    dispatch(loadTrack(trackId))
      .then(({ editable }) => {
        if (!editable) throw new ForbiddenError()
      })
      .then(onLoadSuccess)
      .catch(onError)
  }, [dispatch, trackId, onLoadStart, onLoadSuccess, onError])

  return (
    <PageWrapper {...status}>
      <PageContext value={{ trackId, locationState }}>
        <TrackEdit />
      </PageContext>
    </PageWrapper>
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
