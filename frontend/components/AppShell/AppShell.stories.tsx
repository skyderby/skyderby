import React from 'react'
import { rest } from 'msw'
import { Routes, Route } from 'react-router-dom'

import AppShell from './'
import PageLoading from 'components/LoadingSpinner'
import ErrorPage from 'components/ErrorPage'

export default {
  title: 'screens/AppShell',
  component: AppShell
}

const notAuthorizedParams = {
  msw: [
    rest.get('/api/v1/current_user', (req, res, ctx) =>
      res(ctx.json({ authorized: false }))
    )
  ]
}

const authorizedParams = {
  msw: [
    rest.get('/api/v1/current_user', (req, res, ctx) =>
      res(
        ctx.json({
          authorized: true,
          userId: 3,
          email: 'user@example.com',
          profileId: 3,
          name: 'Aleksandr Kunin',
          countryId: 3,
          photo: {
            thumb: 'https://loremflickr.com/34/34/selfie'
          },
          permissions: {
            canCreatePlace: true,
            canManageUsers: true
          }
        })
      )
    )
  ]
}

export const NotLoggedIn = () => (
  <Routes>
    <Route path="*" element={<AppShell />}>
      <Route path="*" element={<h1 style={{ textAlign: 'center' }}>App</h1>} />
    </Route>
  </Routes>
)
NotLoggedIn.parameters = notAuthorizedParams

export const LoggedIn = () => (
  <Routes>
    <Route path="*" element={<AppShell />}>
      <Route path="*" element={<h1 style={{ textAlign: 'center' }}>App</h1>} />
    </Route>
  </Routes>
)
LoggedIn.parameters = authorizedParams

export const LoadingState = () => (
  <Routes>
    <Route path="*" element={<AppShell />}>
      <Route path="*" element={<PageLoading />} />
    </Route>
  </Routes>
)
LoadingState.parameters = notAuthorizedParams

export const Error = () => (
  <Routes>
    <Route path="*" element={<AppShell />}>
      <Route path="*" element={<ErrorPage.NotFound />} />
    </Route>
  </Routes>
)
Error.parameters = notAuthorizedParams
