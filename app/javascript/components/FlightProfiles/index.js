import React, { useState } from 'react'
import PropTypes from 'prop-types'

import FlightProfilesChart from './FlightProfilesChart'
import TerrainClearanceChart from './TerrainClearanceChart'
import Tagbar from './Tagbar'
import TrackList from './TrackList'
import TerrainProfileSelect from './TerrainProfileSelect'

import styles from './styles.module.scss'

const FlightProfiles = props => {
  const [zoomLevel, setZoomLevel] = useState()

  const {
    tracks,
    tracksParams: { filters },
    updateFilters,
    loadMoreTracks,
    selectedTracks,
    selectedTerrainProfile,
    setSelectedTerrainProfile,
    toggleTrack
  } = props

  return (
    <div className={styles.container}>
      <div className={styles.settingsContainer}>
        <TrackList
          tracks={tracks}
          filters={filters}
          selectedTracks={selectedTracks}
          toggleTrack={toggleTrack}
          updateFilters={updateFilters}
          loadMoreTracks={loadMoreTracks}
        />

        <div className={styles.terrainProfileSelect}>
          <TerrainProfileSelect
            value={selectedTerrainProfile}
            onChange={option => setSelectedTerrainProfile(option?.value || null)}
          />
        </div>
      </div>

      <div className={styles.charts}>
        <div>
          <FlightProfilesChart
            selectedTracks={selectedTracks}
            selectedTerrainProfile={selectedTerrainProfile}
            onZoomChange={setZoomLevel}
          />
        </div>

        <Tagbar
          selectedTracks={selectedTracks}
          selectedTerrainProfile={selectedTerrainProfile}
          toggleTrack={toggleTrack}
          setSelectedTerrainProfile={setSelectedTerrainProfile}
        />

        <div>
          <TerrainClearanceChart
            zoomLevel={zoomLevel}
            selectedTracks={selectedTracks}
            selectedTerrainProfile={selectedTerrainProfile}
          />
        </div>
      </div>
    </div>
  )
}

FlightProfiles.propTypes = {
  loadMoreTracks: PropTypes.func.isRequired,
  selectedTerrainProfile: PropTypes.number,
  selectedTracks: PropTypes.arrayOf(PropTypes.number).isRequired,
  setSelectedTerrainProfile: PropTypes.func.isRequired,
  toggleTrack: PropTypes.func.isRequired,
  tracks: PropTypes.array.isRequired,
  tracksParams: PropTypes.shape({
    filters: PropTypes.arrayOf(PropTypes.array)
  }).isRequired,
  updateFilters: PropTypes.func.isRequired
}

export default FlightProfiles
