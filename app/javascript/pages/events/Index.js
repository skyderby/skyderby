import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import AppShell from 'components/AppShell'
import EventsIndex from 'components/EventsIndex'
import { bulkLoadPlaces } from 'redux/places'
import useEventsApi from 'hooks/useEventsApi'

const Index = () => {
  const dispatch = useDispatch()
  const { events, pagination } = useEventsApi({})
  const buildUrl = () => {}

  useEffect(() => {
    const placeIds = events.map(event => event.placeId).filter(Boolean)
    if (placeIds.length === 0) return

    dispatch(bulkLoadPlaces(placeIds))
  }, [dispatch, events])

  return (
    <AppShell>
      <EventsIndex buildUrl={buildUrl} events={events} pagination={pagination} />
    </AppShell>
  )
}

export default Index
