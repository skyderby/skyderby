import React, { useLayoutEffect } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

import store from 'redux/store'
import TranslationsProvider from 'components/TranslationsProvider'
import AppRouter from './AppRouter'

import 'styles/globalStyles'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnMount: false
    }
  }
})

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
