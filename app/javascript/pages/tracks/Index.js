import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'

import { mapParamsToUrl, extractParamsFromUrl } from 'api/Track'
import { loadTracks } from 'redux/tracks/tracksIndex'
import { PageContext } from 'components/PageContext'
import TrackList from 'components/TrackList'

const TracksIndex = ({ location }) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const [params, setParams] = useState(() => extractParamsFromUrl(location.search))

  useEffect(() => {
    const parsedParams = extractParamsFromUrl(location.search)

    if (JSON.stringify(params) === JSON.stringify(parsedParams)) return

    setParams(parsedParams)
  }, [params, setParams, location.search])

  const buildUrl = useCallback(newParams => mapParamsToUrl({ ...params, ...newParams }), [
    params
  ])

  const updateFilters = useCallback(
    filters => history.replace(`${location.pathname}${buildUrl({ filters, page: 1 })}`),
    [buildUrl, history, location.pathname]
  )

  useEffect(() => {
    dispatch(loadTracks(params))
  }, [dispatch, params])

  return (
    <PageContext value={{ updateFilters, buildUrl, params }}>
      <TrackList />
    </PageContext>
  )
}

TracksIndex.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
    pathname: PropTypes.string
  })
}

export default TracksIndex
