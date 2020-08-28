import React from 'react'

import { usePageContext } from 'components/PageContext'
import TerrainProfileTag from './TerrainProfileTag'
import TrackTag from './TrackTag'
import { Container, TagList } from './elements'

const Tagbar = () => {
  const {
    selectedTracks,
    selectedTerrainProfile,
    toggleTrack,
    setSelectedTerrainProfile
  } = usePageContext()

  const deleteTerrainProfile = () => setSelectedTerrainProfile(null)
  const deleteTrack = trackId => toggleTrack(trackId)

  return (
    <Container>
      <TagList>
        {selectedTerrainProfile && (
          <TerrainProfileTag
            terrainProfileId={selectedTerrainProfile}
            onDelete={deleteTerrainProfile}
          />
        )}
        {selectedTracks.map(trackId => (
          <TrackTag
            key={trackId}
            trackId={trackId}
            onDelete={() => deleteTrack(trackId)}
          />
        ))}
      </TagList>
    </Container>
  )
}

export default Tagbar
