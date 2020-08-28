import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import isEqual from 'lodash.isequal'
import PropTypes from 'prop-types'

import { IndexParams } from 'api/Track'
import { loadTracks } from 'redux/tracks/tracksIndex'
import { PageContext } from 'components/PageContext'
import TrackList from 'components/TrackList'

const TracksIndex = ({ location }) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const [params, setParams] = useState(() => IndexParams.extractFromUrl(location.search))

  useEffect(() => {
    const parsedParams = IndexParams.extractFromUrl(location.search)

    if (isEqual(params, parsedParams)) return

    setParams(parsedParams)
  }, [params, setParams, location.search])

  const buildUrl = useCallback(
    newParams => IndexParams.mapToUrl({ ...params, ...newParams }),
    [params]
  )

  const updateFilters = useCallback(
    filters => history.replace(`${location.pathname}${buildUrl({ filters, page: 1 })}`),
    [buildUrl, history, location.pathname]
  )

  const updateSort = useCallback(
    sortBy => history.replace(`${location.pathname}${buildUrl({ sortBy, page: 1 })}`),
    [buildUrl, history, location.pathname]
  )

  useEffect(() => {
    dispatch(loadTracks(params))
  }, [dispatch, params])

  return (
    <PageContext value={{ updateFilters, updateSort, buildUrl, params }}>
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
