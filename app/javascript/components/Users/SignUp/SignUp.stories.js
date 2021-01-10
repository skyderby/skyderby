import React from 'react'
import { Provider } from 'react-redux'

import { createStore } from 'redux/store'
import SignUp from './'

export default {
  title: 'screens/SignUp',
  component: SignUp
}

export const Default = () => (
  <Provider store={createStore()}>
    <SignUp />
  </Provider>
)
