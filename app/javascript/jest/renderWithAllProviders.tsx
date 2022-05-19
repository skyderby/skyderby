import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter } from 'react-router-dom'

import TranslationsProvider from 'components/TranslationsProvider'

export const queryClient = new QueryClient()

const renderWithAllProviders = (ui: React.ReactNode) => {
  const screen = render(
    <QueryClientProvider client={queryClient}>
      <TranslationsProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </TranslationsProvider>
    </QueryClientProvider>
  )

  return { ...screen }
}

export default renderWithAllProviders
