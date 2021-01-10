import React from 'react'
import { Provider } from 'react-redux'

import { createStore } from 'redux/store'
import SignIn from './'

export default {
  title: 'screens/SignIn',
  component: SignIn
}

export const Default = () => (
  <Provider store={createStore()}>
    <SignIn afterLoginUrl="/" />
  </Provider>
)
