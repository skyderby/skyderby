import { useEffect, useReducer, useCallback, useRef } from 'react'
import isEqual from 'lodash.isequal'

import TrackApi from 'api/Track'

const initialState = {
  status: 'idle',
  tracks: [],
  page: 1,
  hasMore: false
}

const tracksReducer = (state, { type, payload }) => {
  switch (type) {
    case 'LOAD_SUCCESS':
      return {
        status: 'idle',
        tracks: payload.items,
        page: payload.currentPage,
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
        tracks: [...state.tracks, ...payload.items],
        page: payload.currentPage,
        hasMore: payload.currentPage < payload.totalPages
      }
    default:
      return state
  }
}

const useTracksApi = params => {
  const previousParams = useRef()

  const [state, stateReducer] = useReducer(tracksReducer, initialState)

  const loadTracks = useCallback(
    () =>
      TrackApi.findAll({ ...params, activity: 'base' }).then(data =>
        stateReducer({ type: 'LOAD_SUCCESS', payload: data })
      ),
    [params]
  )

  const loadMoreTracks = () => {
    if (!state.hasMore || state.status === 'loadingMore') return

    stateReducer({ type: 'LOADING_MORE' })

    TrackApi.findAll({ ...params, activity: 'base', page: state.page + 1 }).then(data =>
      stateReducer({ type: 'LOAD_MORE_SUCCESS', payload: data })
    )
  }

  useEffect(() => {
    const skipLoad = isEqual(previousParams.current, params)

    if (skipLoad) return

    loadTracks()

    previousParams.current = params
  }, [loadTracks, params])

  return { tracks: state.tracks, loadTracks, loadMoreTracks }
}

export default useTracksApi
