import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

import Landing from 'components/Landing'
import Legal from 'components/Legal'
import Tracks from 'components/Tracks'
import Events from 'components/Events'
import FlightProfiles from 'components/FlightProfiles'
import Places from 'components/Places'
import Suits from 'components/Suits'
import Users from 'components/Users'
import AppShell from 'components/AppShell'
import ErrorPage from 'components/ErrorPage'

const reportLocation = pagePath =>
  window.gtag('event', 'page_view', { page_path: pagePath })

const AppRouter = () => {
  const location = useLocation()

  useEffect(() => {
    const pagePath = location.pathname + location.search
    reportLocation(pagePath)
  }, [location])

  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Landing />} />
        <Route path="flight_profiles" element={<FlightProfiles />} />
        <Route path="tracks/*" element={<Tracks />} />
        <Route path="events/*" element={<Events />} />
        <Route path="places/*" element={<Places />} />
        <Route path="suits/*" element={<Suits />} />
        <Route path="/legal/*" element={<Legal />} />

        <Route path="*" element={<ErrorPage.NotFound />} />
      </Route>

      <Route path="/users/*" element={<Users />} />
    </Routes>
  )
}

export default AppRouter
