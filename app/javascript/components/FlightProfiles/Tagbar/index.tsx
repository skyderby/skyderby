import React from 'react'

import TerrainProfileTag from './TerrainProfileTag'
import TrackTag from './TrackTag'

import styles from './styles.module.scss'
import usePageParams from 'components/FlightProfiles/usePageParams'

const Tagbar = (): JSX.Element => {
  const {
    params: { selectedTracks, selectedTerrainProfile, additionalTerrainProfiles },
    setSelectedTerrainProfile,
    deleteAdditionalTerrainProfile,
    toggleTrack
  } = usePageParams()

  const deleteTerrainProfile = () => setSelectedTerrainProfile(null)
  const deleteTrack = (trackId: number) => toggleTrack(trackId)

  return (
    <div className={styles.container}>
      <ul className={styles.tagList}>
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
          <React.Suspense fallback={null} key={`track-${trackId}`}>
            <TrackTag trackId={trackId} onDelete={() => deleteTrack(trackId)} />
          </React.Suspense>
        ))}
      </ul>
    </div>
  )
}

export default Tagbar
