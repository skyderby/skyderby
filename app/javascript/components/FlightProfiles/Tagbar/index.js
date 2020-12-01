import React from 'react'
import PropTypes from 'prop-types'

import TerrainProfileTag from './TerrainProfileTag'
import TrackTag from './TrackTag'

import styles from './styles.module.scss'

const Tagbar = ({
  selectedTracks,
  selectedTerrainProfile,
  toggleTrack,
  setSelectedTerrainProfile,
  additionalTerrainProfiles,
  deleteAdditionalTerrainProfile
}) => {
  const deleteTerrainProfile = () => setSelectedTerrainProfile(null)
  const deleteTrack = trackId => toggleTrack(trackId)

  return (
    <div className={styles.container}>
      <ul className={styles.tagList}>
        {selectedTerrainProfile && (
          <TerrainProfileTag
            terrainProfileId={selectedTerrainProfile}
            onDelete={deleteTerrainProfile}
          />
        )}

        {additionalTerrainProfiles.map(id => (
          <TerrainProfileTag
            key={id}
            terrainProfileId={id}
            onDelete={() => deleteAdditionalTerrainProfile(id)}
          />
        ))}

        {selectedTracks.map(trackId => (
          <TrackTag
            key={trackId}
            trackId={trackId}
            onDelete={() => deleteTrack(trackId)}
          />
        ))}
      </ul>
    </div>
  )
}

Tagbar.propTypes = {
  selectedTracks: PropTypes.arrayOf(PropTypes.number).isRequired,
  selectedTerrainProfile: PropTypes.number,
  toggleTrack: PropTypes.func.isRequired,
  setSelectedTerrainProfile: PropTypes.func.isRequired,
  additionalTerrainProfiles: PropTypes.arrayOf(PropTypes.number).isRequired,
  deleteAdditionalTerrainProfile: PropTypes.func.isRequired
}

export default Tagbar
