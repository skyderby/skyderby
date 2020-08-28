import React from 'react'
import PropTypes from 'prop-types'

import Item from './Item'
import { Container } from './elements'
import TokenizedSearchField from 'components/TokenizedSearchField'

const TrackList = props => {
  const {
    tracks,
    filters,
    updateFilters,
    loadMoreTracks,
    selectedTracks,
    toggleTrack
  } = props

  const handleListScroll = e => {
    const element = e.target
    const scrollPercent =
      ((element.scrollTop + element.clientHeight) / element.scrollHeight) * 100

    if (scrollPercent > 85) loadMoreTracks()
  }

  return (
    <Container onScroll={handleListScroll}>
      <TokenizedSearchField initialValues={filters} onChange={updateFilters} />

      {tracks.map(track => (
        <Item
          key={track.id}
          track={track}
          active={selectedTracks.includes(track.id)}
          onClick={() => toggleTrack(track.id)}
        />
      ))}
    </Container>
  )
}

TrackList.propTypes = {
  tracks: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number.isRequired })),
  selectedTracks: PropTypes.arrayOf(PropTypes.number).isRequired,
  loadMoreTracks: PropTypes.func.isRequired,
  toggleTrack: PropTypes.func.isRequired,
  updateFilters: PropTypes.func.isRequired,
  filters: PropTypes.arrayOf(PropTypes.array).isRequired
}

export default TrackList
