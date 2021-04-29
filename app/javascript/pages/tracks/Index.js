import React, { useEffect, useState, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import isEqual from 'lodash.isequal'
import PropTypes from 'prop-types'

import { extractParamsFromUrl, mapParamsToUrl, useTracksQuery } from 'api/hooks/tracks'
import AppShell from 'components/AppShell'
import TrackList from 'components/TracksIndex'
import PageWrapper from 'components/PageWrapper'

const TracksIndex = ({ location }) => {
  const history = useHistory()
  const [params, setParams] = useState(() => extractParamsFromUrl(location.search))

  const { data = {}, status, error } = useTracksQuery(params)
  const tracks = data.items || []
  const pagination = { page: data.currentPage, totalPages: data.totalPages }

  useEffect(() => {
    const parsedParams = extractParamsFromUrl(location.search)

    if (isEqual(params, parsedParams)) return

    setParams(parsedParams)
  }, [params, setParams, location.search])

  const buildUrl = useCallback(newParams => mapParamsToUrl({ ...params, ...newParams }), [
    params
  ])

  const updateFilters = useCallback(
    filters => history.replace(`${location.pathname}${buildUrl({ filters, page: 1 })}`),
    [buildUrl, history, location.pathname]
  )

  const updateSort = useCallback(
    sortBy => history.replace(`${location.pathname}${buildUrl({ sortBy, page: 1 })}`),
    [buildUrl, history, location.pathname]
  )

  return (
    <AppShell>
      <PageWrapper status={status} error={error}>
        <TrackList
          tracks={tracks}
          pagination={pagination}
          updateFilters={updateFilters}
          updateSort={updateSort}
          params={params}
          buildUrl={buildUrl}
        />
      </PageWrapper>
    </AppShell>
  )
}

TracksIndex.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
    pathname: PropTypes.string
  })
}

export default TracksIndex
