import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  selectedTracksSelector,
  selectedTerrainProfileSelector,
  selectTerrainProfile,
  toggleTrack
} from 'redux/flightProfiles'

import TerrainProfileTag from './TerrainProfileTag'
import TrackTag from './TrackTag'
import { TagList } from './elements'

const Tagbar = () => {
  const dispatch = useDispatch()
  const terrainProfileId = useSelector(selectedTerrainProfileSelector)
  const selectedTracks = useSelector(selectedTracksSelector)

  const handleDeleteTerrainProfile = () => dispatch(selectTerrainProfile(null))
  const handleDeleteTrack = trackId => dispatch(toggleTrack(trackId))

  return (
    <div>
      <TagList>
        {terrainProfileId && (
          <TerrainProfileTag
            terrainProfileId={terrainProfileId}
            onDelete={handleDeleteTerrainProfile}
          />
        )}
        {selectedTracks.map(trackId => (
          <TrackTag
            key={trackId}
            trackId={trackId}
            onDelete={() => handleDeleteTrack(trackId)}
          />
        ))}
      </TagList>
    </div>
  )
}

export default Tagbar
