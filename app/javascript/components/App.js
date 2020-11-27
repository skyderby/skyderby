import React, { useLayoutEffect } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

import store from 'redux/store'
import TranslationsProvider from 'components/TranslationsProvider'
import AppRouter from './AppRouter'

import 'styles/globalStyles'

const App = () => {
  useLayoutEffect(() => {
    const keyPressListener = e => {
      if (e.code !== 'Tab') return

      document.querySelector('body').classList.add('keyboardNavigation')
    }
    const clickListener = () => {
      document.querySelector('body').classList.remove('keyboardNavigation')
    }

    document.addEventListener('keydown', keyPressListener)
    document.addEventListener('click', clickListener)

    return () => {
      document.removeEventListener('keydown', keyPressListener)
      document.removeEventListener('click', clickListener)
    }
  }, [])

  return (
    <Provider store={store}>
      <TranslationsProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </TranslationsProvider>
    </Provider>
  )
}

export default App
