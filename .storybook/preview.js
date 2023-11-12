import React from 'react'
import { initializeWorker, mswDecorator } from 'msw-storybook-addon'
import { MemoryRouter as Router } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'

import TranslationsProvider from 'components/TranslationsProvider'
import queryClient from 'components/queryClient'
import 'styles/globalStyles.scss'

initializeWorker()

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  layout: 'fullscreen'
}

const providersDecorator = Story => (
  <Router>
    <div id="modal-root" />
    <div id="dropdowns-root" />
    <QueryClientProvider client={queryClient}>
      <TranslationsProvider>
        <Story />
      </TranslationsProvider>
    </QueryClientProvider>
  </Router>
)

const cacheResetDecorator = Story => {
  queryClient.clear()
  return <Story />
}

export const decorators = [mswDecorator, cacheResetDecorator, providersDecorator]
