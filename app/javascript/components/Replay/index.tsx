import React from 'react'
import usePageParams from 'components/FlightProfiles/usePageParams'
import TrackList from 'components/TrackListSidebar'
import styles from './styles.module.scss'

const Replay = () => {
  const {
    params: { tracksParams, selectedTracks },
    updateFilters,
    toggleTrack
  } = usePageParams()

  return (
    <div className={styles.container}>
      <aside>
        <TrackList
          activity="skydive"
          tracksParams={tracksParams}
          selectedTracks={selectedTracks}
          onFilterChange={updateFilters}
          onTrackToggle={toggleTrack}
        />
      </aside>
      <main>Replay</main>
    </div>
  )
}

export default Replay
