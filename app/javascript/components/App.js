import React, { useLayoutEffect } from 'react'
import { QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Helmet } from 'react-helmet'

import store from 'redux/store'
import TranslationsProvider from 'components/TranslationsProvider'
import AppRouter from './AppRouter'
import queryClient from './queryClient'

import 'normalize.css'
import 'tippy.js/dist/tippy.css'
import 'styles/globalStyles.scss'

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
    <QueryClientProvider client={queryClient}>
      <Helmet defaultTitle="Skyderby" titleTemplate="%s | Skyderby" />

      <Toaster
        containerStyle={{ top: 75 }}
        toastOptions={{
          style: {
            borderRadius: 'var(--border-radius-md)'
          },
          error: {
            duration: 6000,
            style: {
              border: '1px solid var(--red-90)',
              color: 'var(--red-90)',
              fontWeight: 500,
              backgroundColor: 'var(--red-20)'
            }
          }
        }}
      />

      <Provider store={store}>
        <TranslationsProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </TranslationsProvider>
      </Provider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
