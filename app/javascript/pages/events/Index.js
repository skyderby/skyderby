import React from 'react'

import AppShell from 'components/AppShell'
import EventsIndex from 'components/EventsIndex'
import useEventsApi from 'hooks/useEventsApi'

const Index = () => {
  const { events, pagination } = useEventsApi({})
  const buildUrl = () => {}

  return (
    <AppShell>
      <EventsIndex buildUrl={buildUrl} events={events} pagination={pagination} />
    </AppShell>
  )
}

export default Index
