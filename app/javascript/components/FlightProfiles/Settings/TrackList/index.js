import React, { useEffect, useState, useReducer } from 'react'
import { useLocation } from 'react-router-dom'

import TrackApi, { IndexParams } from 'api/Track'

import Item from './Item'
import { Container } from './elements'
import TokenizedSearchField from 'components/TokenizedSearchField'

const initialState = {
  tracks: [],
  page: 1,
  hasMore: false
}

const tracksReducer = (state, { type, payload }) => {
  switch (type) {
    case 'LOAD':
      return {
        tracks: payload.items,
        page: payload.currentPage,
        hasMore: payload.currentPage < payload.totalPages
      }
    default:
      return state
  }
}

const TrackList = () => {
  const location = useLocation()

  const [params, setParams] = useState(() =>
    IndexParams.extractFromUrl(location.search, 'tracks')
  )
  const [state, stateReducer] = useReducer(tracksReducer, initialState)

  useEffect(() => {
    TrackApi.findAll({ ...params, activity: 'base' }).then(data =>
      stateReducer({ type: 'LOAD', payload: data })
    )
  }, [params])

  const handleChange = filters =>
    setParams(params => ({
      ...params,
      filters
    }))

  return (
    <Container>
      <TokenizedSearchField initialValues={[]} onChange={handleChange} />

      {state.tracks.map(track => (
        <Item key={track.id} track={track} />
      ))}
    </Container>
  )
}

export default TrackList
