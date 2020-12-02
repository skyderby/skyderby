import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import CogIcon from 'icons/cog'
import { STRAIGHT_LINE, TRAJECTORY_DISTANCE } from 'redux/userPreferences'
import FlightProfilesChart from './FlightProfilesChart'
import TerrainClearanceChart from './TerrainClearanceChart'
import Tagbar from './Tagbar'
import TrackList from './TrackList'
import TerrainProfileSelect from './TerrainProfileSelect'
import SettingsModal from './SettingsModal'

import styles from './styles.module.scss'

const FlightProfiles = props => {
  const [zoomLevel, setZoomLevel] = useState()
  const [showModal, setShowModal] = useState(false)
  const { t } = useI18n()

  const {
    additionalTerrainProfiles,
    tracks,
    tracksParams: { filters },
    updateFilters,
    loadMoreTracks,
    selectedTracks,
    selectedTerrainProfile,
    setSelectedTerrainProfile,
    distanceCalculationMethod,
    straightLine,
    setDistanceCalculationMethod,
    setAdditionalTerrainProfiles,
    deleteAdditionalTerrainProfile,
    toggleTrack
  } = props

  const applySettings = ({ calculateDistanceBy, additionalTerrainProfiles }) => {
    setDistanceCalculationMethod(calculateDistanceBy)
    setAdditionalTerrainProfiles(additionalTerrainProfiles)

    setShowModal(false)
  }

  return (
    <main id="maincontent" className={styles.container}>
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
            additionalTerrainProfiles={additionalTerrainProfiles}
            selectedTracks={selectedTracks}
            selectedTerrainProfile={selectedTerrainProfile}
            straightLine={straightLine}
            onZoomChange={setZoomLevel}
          />
        </div>

        <Tagbar
          selectedTracks={selectedTracks}
          selectedTerrainProfile={selectedTerrainProfile}
          toggleTrack={toggleTrack}
          setSelectedTerrainProfile={setSelectedTerrainProfile}
          additionalTerrainProfiles={additionalTerrainProfiles}
          deleteAdditionalTerrainProfile={deleteAdditionalTerrainProfile}
        />

        <div>
          <TerrainClearanceChart
            zoomLevel={zoomLevel}
            selectedTracks={selectedTracks}
            selectedTerrainProfile={selectedTerrainProfile}
            straightLine={straightLine}
          />
        </div>

        <button
          className={styles.fab}
          onClick={() => setShowModal(true)}
          aria-label={t('general.settings')}
        >
          <CogIcon />
        </button>

        <SettingsModal
          initialValues={{
            calculateDistanceBy: distanceCalculationMethod,
            additionalTerrainProfiles
          }}
          isShown={showModal}
          onHide={() => setShowModal(false)}
          onSubmit={applySettings}
        />
      </div>
    </main>
  )
}

FlightProfiles.propTypes = {
  additionalTerrainProfiles: PropTypes.arrayOf(PropTypes.number).isRequired,
  distanceCalculationMethod: PropTypes.oneOf([STRAIGHT_LINE, TRAJECTORY_DISTANCE])
    .isRequired,
  setDistanceCalculationMethod: PropTypes.func.isRequired,
  setAdditionalTerrainProfiles: PropTypes.func.isRequired,
  deleteAdditionalTerrainProfile: PropTypes.func.isRequired,
  loadMoreTracks: PropTypes.func.isRequired,
  selectedTerrainProfile: PropTypes.number,
  selectedTracks: PropTypes.arrayOf(PropTypes.number).isRequired,
  setSelectedTerrainProfile: PropTypes.func.isRequired,
  straightLine: PropTypes.bool.isRequired,
  toggleTrack: PropTypes.func.isRequired,
  tracks: PropTypes.array.isRequired,
  tracksParams: PropTypes.shape({
    filters: PropTypes.arrayOf(PropTypes.array)
  }).isRequired,
  updateFilters: PropTypes.func.isRequired
}

export default FlightProfiles
