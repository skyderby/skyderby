import React, { useEffect, useState } from 'react'
import isEqual from 'lodash.isequal'
import PropTypes from 'prop-types'

import { useEventsQuery } from 'api/hooks/events'
import AppShell from 'components/AppShell'
import EventsIndex from 'components/EventsIndex'
import PageWrapper from 'components/PageWrapper'

const extractParamsFromUrl = search => {
  const urlParams = new URLSearchParams(search)
  const page = urlParams.get('page') || '1'

  return { page }
}

const mapParamsToUrl = ({ page }) => {
  const params = new URLSearchParams()
  params.set('page', page)

  return params.toString() === '' ? '' : '?' + params.toString()
}

const Index = ({ location }) => {
  const [params, setParams] = useState(() => extractParamsFromUrl(location.search))
  const { data = {}, status, error } = useEventsQuery(params)
  const events = data.items || []
  const pagination = { page: data.currentPage, totalPages: data.totalPages }

  useEffect(() => {
    const parsedParams = extractParamsFromUrl(location.search)

    if (isEqual(params, parsedParams)) return

    setParams(parsedParams)
  }, [params, setParams, location.search])

  return (
    <AppShell>
      <PageWrapper status={status} error={error}>
        <EventsIndex buildUrl={mapParamsToUrl} events={events} pagination={pagination} />
      </PageWrapper>
    </AppShell>
  )
}

Index.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
    pathname: PropTypes.string
  })
}

export default Index
