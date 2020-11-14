import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import isEqual from 'lodash.isequal'
import PropTypes from 'prop-types'

import AppShell from 'components/AppShell'
import EventsIndex from 'components/EventsIndex'
import { bulkLoadPlaces } from 'redux/places'
import useEventsApi from 'hooks/useEventsApi'

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
  const dispatch = useDispatch()
  const [params, setParams] = useState(() => extractParamsFromUrl(location.search))
  const { events, pagination } = useEventsApi(params)

  useEffect(() => {
    const placeIds = events.map(event => event.placeId).filter(Boolean)
    if (placeIds.length === 0) return

    dispatch(bulkLoadPlaces(placeIds))
  }, [dispatch, events])

  useEffect(() => {
    const parsedParams = extractParamsFromUrl(location.search)

    if (isEqual(params, parsedParams)) return

    setParams(parsedParams)
  }, [params, setParams, location.search])

  return (
    <AppShell>
      <EventsIndex buildUrl={mapParamsToUrl} events={events} pagination={pagination} />
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
