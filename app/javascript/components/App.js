import React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

import store from 'redux/store'
import TranslationsProvider from 'components/TranslationsProvider'
import AppRouter from './AppRouter'

import 'styles/globalStyles'

const App = () => (
  <Provider store={store}>
    <TranslationsProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </TranslationsProvider>
  </Provider>
)

export default App
