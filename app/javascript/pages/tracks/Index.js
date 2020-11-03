import React, { useEffect, useState, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import isEqual from 'lodash.isequal'
import PropTypes from 'prop-types'

import { IndexParams } from 'api/Track'
import useTracksApi from 'hooks/useTracksApi'
import { PageContext } from 'components/PageContext'
import AppShell from 'components/AppShell'
import TrackList from 'components/TracksIndex'

const TracksIndex = ({ location }) => {
  const history = useHistory()

  const [params, setParams] = useState(() => IndexParams.extractFromUrl(location.search))

  const { tracks, pagination } = useTracksApi(params)

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

  return (
    <AppShell>
      <PageContext value={{ updateFilters, updateSort, buildUrl, params }}>
        <TrackList
          tracks={tracks}
          pagination={pagination}
          params={params}
          buildUrl={buildUrl}
        />
      </PageContext>
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
