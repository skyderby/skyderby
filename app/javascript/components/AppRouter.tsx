import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

import Landing from 'components/Landing'
import Admin from 'components/Admin'
import Tracks from 'components/Tracks'
import Events from 'components/Events'
import OnlineRankings from 'components/OnlineRankings'
import FlightProfiles from 'components/FlightProfiles'
import Places from 'components/Places'
import Suits from 'components/Suits'
import Users from 'components/Users'
import AppShell from 'components/AppShell'
import ErrorPage from 'components/ErrorPage'
import ResultIframe from 'components/Events/SpeedSkydivingCompetition/ResultIframe'

const reportLocation = (pagePath: string) =>
  window.gtag('event', 'page_view', { page_path: pagePath })

const AppRouter = () => {
  const location = useLocation()

  useEffect(() => {
    const pagePath = location.pathname + location.search
    reportLocation(pagePath)
  }, [location])

  return (
    <React.Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Landing />} />
          <Route path="flight_profiles" element={<FlightProfiles />} />
          <Route path="tracks/*" element={<Tracks />} />
          <Route path="events/*" element={<Events />} />
          <Route path="online_rankings/*" element={<OnlineRankings />} />
        <Route path="places/*" element={<Places />} />
          <Route path="suits/*" element={<Suits />} />
          <Route path="admin/*" element={<Admin />} />

          <Route path="*" element={<ErrorPage.NotFound />} />
        </Route>

        <Route
          path="/iframes/events/speed_skydiving/:eventId/results/:resultId"
          element={<ResultIframe />}
        />

        <Route path="/users/*" element={<Users />} />
      </Routes>
    </React.Suspense>
  )
}

export default AppRouter
