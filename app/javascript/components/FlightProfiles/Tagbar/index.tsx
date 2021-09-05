import React from 'react'
import { AnimatePresence } from 'framer-motion'

import TerrainProfileTag from './TerrainProfileTag'
import TrackTag from './TrackTag'

import styles from './styles.module.scss'

type TagbarProps = {
  selectedTracks: number[]
  selectedTerrainProfile: number | undefined
  additionalTerrainProfiles: number[]
  toggleTrack: (id: number) => unknown
  setSelectedTerrainProfile: (id: null) => unknown
  deleteAdditionalTerrainProfile: (id: number) => unknown
}

const Tagbar = ({
  selectedTracks,
  selectedTerrainProfile,
  additionalTerrainProfiles,
  toggleTrack,
  setSelectedTerrainProfile,
  deleteAdditionalTerrainProfile
}: TagbarProps): JSX.Element => {
  const deleteTerrainProfile = () => setSelectedTerrainProfile(null)
  const deleteTrack = (trackId: number) => toggleTrack(trackId)

  return (
    <div className={styles.container}>
      <ul className={styles.tagList}>
        <AnimatePresence>
          {selectedTerrainProfile && (
            <TerrainProfileTag
              key="selected-terrain-profile"
              terrainProfileId={selectedTerrainProfile}
              onDelete={deleteTerrainProfile}
            />
          )}

          {additionalTerrainProfiles.map(id => (
            <TerrainProfileTag
              key={`additional-terrain-profile-${id}`}
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
        </AnimatePresence>
      </ul>
    </div>
  )
}

export default Tagbar
