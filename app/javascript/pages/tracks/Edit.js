import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import TrackEdit from 'components/TrackEdit'
import { PageContext } from 'components/PageContext'
import { loadTrack } from 'redux/tracks'

const Edit = ({ match }) => {
  const dispatch = useDispatch()
  const trackId = Number(match.params.id)

  useEffect(() => {
    dispatch(loadTrack(trackId))
  }, [dispatch, trackId])

  return (
    <PageContext value={{ trackId }}>
      <TrackEdit />
    </PageContext>
  )
}

Edit.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default Edit
