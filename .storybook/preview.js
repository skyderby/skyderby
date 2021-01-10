import React from 'react'
import { MemoryRouter as Router } from 'react-router-dom'

import 'styles/globalStyles.scss'
import TranslationsProvider from '../app/javascript/components/TranslationsProvider'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  layout: 'fullscreen'
}

export const decorators = [
  Story => (
    <Router>
      <div id="modal-root" />
      <div id="dropdowns-root" />
      <TranslationsProvider>
        <Story />
      </TranslationsProvider>
    </Router>
  )
]
