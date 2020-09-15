import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'

import { rootReducer } from 'redux/store'
import TranslationsProvider from 'components/TranslationsProvider'

export default (ui, initialState) => {
  const store = createStore(rootReducer, initialState, compose(applyMiddleware(thunk)))
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
