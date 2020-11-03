import { useReducer, useCallback } from 'react'

import { ForbiddenError } from 'errors'

const initialState = {
  status: 'idle',
  error: null
}

const pageStatusReducer = (state, { type }) => {
  switch (type) {
    case 'LOAD_START':
      return {
        ...state,
        status: 'loading',
        error: null
      }
    case 'LOAD_SUCCESS':
      return {
        ...state,
        status: 'idle',
        error: null
      }
    case 'NOT_FOUND_ERROR':
      return {
        ...state,
        status: 'error',
        error: {
          title: '404 🤷‍♀️',
          description: "We were looking everywhere but we didn't find it"
        }
      }
    case 'SERVER_ERROR':
      return {
        ...state,
        status: 'error',
        error: {
          title: '500 🤦‍♀️',
          description: "It's our fault not yours"
        }
      }
    case 'FORBIDDEN_ERROR':
      return {
        ...state,
        status: 'error',
        error: {
          title: '🙅‍♀️',
          description: "Nope, you're not allowed."
        }
      }
    default:
      return state
  }
}

const usePageStatus = options => {
  const [state, dispatch] = useReducer(pageStatusReducer, { ...initialState, ...options })

  const onError = useCallback(
    err => {
      if (err.response?.status) {
        if (err.response.status === 404) dispatch({ type: 'NOT_FOUND_ERROR' })
        if (err.response.status === 403) dispatch({ type: 'FORBIDDEN_ERROR' })
        if (Math.floor(err.response.status / 100) === 5)
          dispatch({ type: 'SERVER_ERROR' })
      }

      if (err instanceof ForbiddenError) dispatch({ type: 'FORBIDDEN_ERROR' })
    },
    [dispatch]
  )

  const onLoadStart = useCallback(() => dispatch({ type: 'LOAD_START' }), [dispatch])
  const onLoadSuccess = useCallback(() => dispatch({ type: 'LOAD_SUCCESS' }), [dispatch])

  return [state, { onError, onLoadStart, onLoadSuccess }]
}

export default usePageStatus
