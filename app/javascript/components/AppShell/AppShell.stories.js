import React from 'react'
import { rest } from 'msw'

import AppShell from './'
import PageLoading from 'components/PageWrapper/Loading'
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

export const NotLoggedIn = () => <AppShell>App</AppShell>
NotLoggedIn.parameters = notAuthorizedParams

export const LoggedIn = () => <AppShell>App</AppShell>
LoggedIn.parameters = authorizedParams

export const LoadingState = () => (
  <AppShell>
    <PageLoading />
  </AppShell>
)
LoadingState.parameters = notAuthorizedParams

export const Error = () => (
  <AppShell>
    <ErrorPage.NotFound />
  </AppShell>
)
Error.parameters = notAuthorizedParams
