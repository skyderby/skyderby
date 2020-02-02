import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import { rootReducer } from 'redux/store'

export default (ui, initialState) => {
  const store = createStore(rootReducer, initialState)

  return render(<Provider store={store}>{ui}</Provider>)
}
