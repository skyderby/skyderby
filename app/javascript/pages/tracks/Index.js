import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { isMobileOnly } from 'react-device-detect'
import PropTypes from 'prop-types'

import { loadTracks } from 'redux/tracks/tracksIndex'
import { PageContext } from 'components/PageContext'
import TrackList from 'components/TrackList'

const extractParamsFromUrl = urlSearch => {
  const allParams = Array.from(new URLSearchParams(urlSearch))

  const [_activityKey, activity] = allParams.find(([key]) => key === 'kind') || []
  const [_pageKey, page = 1] = allParams.find(([key]) => key === 'page') || []

  const filters = allParams
    .filter(([key]) => !['kind', 'page'].includes(key))
    .map(([key, value]) => [key.replace('[]', ''), value])

  const perPage = isMobileOnly ? 5 : 25

  return { activity, filters, page, perPage }
}

const mapParamsToUrl = ({ activity, filters, page }) =>
  '?' +
  [
    ['page', Number(page) > 1 ? page : undefined],
    ['kind', activity],
    ...filters.map(([key, value]) => [`${key}[]`, value])
  ]
    .filter(([_key, val]) => val)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

const TracksIndex = ({ location }) => {
  const dispatch = useDispatch()

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
    filters => {
      setParams(params => ({ ...params, filters, page: 1 }))
      const newUrl = `${location.pathname}${buildUrl({ filters })}`

      history.replaceState(null, '', newUrl)
    },
    [buildUrl, location.pathname]
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
