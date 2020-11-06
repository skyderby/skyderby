import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Provider } from 'react-redux'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'

import { createStore } from 'redux/store'
import TranslationsProvider from 'components/TranslationsProvider'

export default (ui, initialState) => {
  const store = createStore(initialState)
  const history = createMemoryHistory()

  const screen = render(
    <Provider store={store}>
      <TranslationsProvider>
        <Router history={history}>{ui}</Router>
      </TranslationsProvider>
    </Provider>
  )

  return { ...screen, history }
}
