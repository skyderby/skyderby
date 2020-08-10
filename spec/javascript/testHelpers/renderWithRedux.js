import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'

import { rootReducer } from 'redux/store'

export default (ui, initialState) => {
  const store = createStore(rootReducer, initialState, compose(applyMiddleware(thunk)))

  return render(<Provider store={store}>{ui}</Provider>)
}
