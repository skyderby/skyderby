import React from 'react'
import { Provider } from 'react-redux'

import { createStore } from 'redux/store'
import PageWrapper from 'components/PageWrapper'
import AppShell from './'

const session = {
  loaded: true,
  currentUser: {
    authorized: true,
    userId: 3,
    email: 'aleksandr@kunin.ru',
    profileId: 3,
    name: 'Aleksandr Kunin',
    countryId: 3,
    photo: {
      thumb: 'https://loremflickr.com/34/34/selfie'
    }
  }
}

export default {
  title: 'components/AppShell',
  component: AppShell
}

export const NotLoggedIn = () => (
  <Provider store={createStore()}>
    <AppShell>App</AppShell>
  </Provider>
)

export const LoggedIn = () => (
  <Provider store={createStore({ session })}>
    <AppShell>App</AppShell>
  </Provider>
)

export const LoadingState = () => (
  <Provider store={createStore()}>
    <AppShell>
      <PageWrapper status="loading">App</PageWrapper>
    </AppShell>
  </Provider>
)

export const Error = () => (
  <Provider store={createStore()}>
    <AppShell>
      <PageWrapper
        status="error"
        error={{
          title: 'Something went wrong',
          description: 'Good news - We are on it',
          linkBack: '/'
        }}
      >
        App
      </PageWrapper>
    </AppShell>
  </Provider>
)
