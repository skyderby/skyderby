import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { isMobileOnly } from 'react-device-detect'

import { loadTracks } from 'redux/tracks/tracksIndex'
import { PageContext } from 'components/PageContext'
import TrackList from 'components/TrackList'

const TracksIndex = () => {
  const dispatch = useDispatch()
  const urlParams = {
    ...Object.fromEntries(new URLSearchParams(useLocation().search)),
    perPage: isMobileOnly ? 5 : 25
  }

  useEffect(() => {
    dispatch(loadTracks(urlParams))
  }, [dispatch, urlParams])

  return (
    <PageContext>
      <TrackList />
    </PageContext>
  )
}

export default TracksIndex
