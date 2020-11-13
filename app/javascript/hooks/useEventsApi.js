import { useEffect, useReducer, useCallback, useRef } from 'react'
import isEqual from 'lodash.isequal'

import EventsApi from 'api/Event'

const initialState = {
  status: 'idle',
  events: [],
  page: 1,
  hasMore: false,
  totalPages: 0
}

const eventsReducer = (state, { type, payload }) => {
  switch (type) {
    case 'LOAD_SUCCESS':
      return {
        status: 'idle',
        events: payload.items,
        page: payload.currentPage,
        totalPages: payload.totalPages,
        hasMore: payload.currentPage < payload.totalPages
      }
    case 'LOADING_MORE':
      return {
        ...state,
        status: 'loadingMore'
      }
    case 'LOAD_MORE_SUCCESS':
      return {
        status: 'idle',
        events: [...state.events, ...payload.items],
        page: payload.currentPage,
        totalPages: payload.totalPages,
        hasMore: payload.currentPage < payload.totalPages
      }
    default:
      return state
  }
}

const useEventsApi = params => {
  const previousParams = useRef()

  const [state, stateReducer] = useReducer(eventsReducer, initialState)

  const loadEvents = useCallback(
    () =>
      EventsApi.findAll({ ...params }).then(data =>
        stateReducer({ type: 'LOAD_SUCCESS', payload: data })
      ),
    [params]
  )

  const loadMoreEvents = () => {
    if (!state.hasMore || state.status === 'loadingMore') return

    stateReducer({ type: 'LOADING_MORE' })

    EventsApi.findAll({ ...params, page: state.page + 1 }).then(data =>
      stateReducer({ type: 'LOAD_MORE_SUCCESS', payload: data })
    )
  }

  useEffect(() => {
    const skipLoad = isEqual(previousParams.current, params)

    if (skipLoad) return

    loadEvents()

    previousParams.current = params
  }, [loadEvents, params])

  const pagination = { page: state.page, totalPages: state.totalPages }

  return { events: state.events, pagination, loadEvents, loadMoreEvents }
}

export default useEventsApi
