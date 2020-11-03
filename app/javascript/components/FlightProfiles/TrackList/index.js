import React from 'react'
import PropTypes from 'prop-types'

import Item from 'components/TrackListItem'
import TokenizedSearchField from 'components/TokenizedSearchField'

import styles from './styles.module.scss'

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
    <div className={styles.container} onScroll={handleListScroll}>
      <TokenizedSearchField initialValues={filters} onChange={updateFilters} />

      {tracks.map(track => (
        <Item
          compact
          key={track.id}
          as="div"
          track={track}
          data-active={selectedTracks.includes(track.id)}
          onClick={() => toggleTrack(track.id)}
        />
      ))}
    </div>
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
