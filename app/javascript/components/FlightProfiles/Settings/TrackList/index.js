import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { IndexParams } from 'api/Track'

import Item from './Item'
import useTracksApi from './useTracksApi'
import { Container } from './elements'
import TokenizedSearchField from 'components/TokenizedSearchField'

const TrackList = () => {
  const location = useLocation()

  const [params, setParams] = useState(() =>
    IndexParams.extractFromUrl(location.search, 'tracks')
  )

  const { tracks, loadTracks, loadMoreTracks } = useTracksApi(params)

  useEffect(() => {
    loadTracks()
  }, [loadTracks])

  const handleListScroll = e => {
    const element = e.target
    const scrollPercent =
      ((element.scrollTop + element.clientHeight) / element.scrollHeight) * 100

    if (scrollPercent > 85) loadMoreTracks()
  }

  const handleChange = filters =>
    setParams(params => ({
      ...params,
      filters
    }))

  return (
    <Container onScroll={handleListScroll}>
      <TokenizedSearchField initialValues={[]} onChange={handleChange} />

      {tracks.map(track => (
        <Item key={track.id} track={track} />
      ))}
    </Container>
  )
}

export default TrackList
