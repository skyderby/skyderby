import React, { useEffect, useRef } from 'react'

import { usePageContext } from 'components/PageContext'

import Item from './Item'
import useTracksApi from './useTracksApi'
import { Container } from './elements'
import TokenizedSearchField from 'components/TokenizedSearchField'

const TrackList = () => {
  const { tracksParams, updateFilters } = usePageContext()
  const previousParams = useRef(tracksParams)

  const { tracks, loadTracks, loadMoreTracks } = useTracksApi(tracksParams)

  useEffect(() => {
    const shouldRefetch =
      JSON.stringify(previousParams.current) === JSON.stringify(tracksParams)

    if (!shouldRefetch) return

    loadTracks()

    previousParams.current = tracksParams
  }, [loadTracks, tracksParams])

  const handleListScroll = e => {
    const element = e.target
    const scrollPercent =
      ((element.scrollTop + element.clientHeight) / element.scrollHeight) * 100

    if (scrollPercent > 85) loadMoreTracks()
  }

  return (
    <Container onScroll={handleListScroll}>
      <TokenizedSearchField
        initialValues={tracksParams.filters}
        onChange={updateFilters}
      />

      {tracks.map(track => (
        <Item key={track.id} track={track} />
      ))}
    </Container>
  )
}

export default TrackList
