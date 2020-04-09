import React from 'react'
import { useSelector } from 'react-redux'

import {
  selectedTracksSelector,
  selectedTerrainProfileSelector
} from 'redux/flightProfiles'
import { createTerrainProfileSelector } from 'redux/terrainProfiles'

import TerrainProfileTag from './TerrainProfileTag'
import TrackTag from './TrackTag'
import { TagList } from './elements'

const Tagbar = () => {
  const terrainProfileId = useSelector(selectedTerrainProfileSelector)
  const selectedTracks = useSelector(selectedTracksSelector)

  return (
    <div>
      <TagList>
        {terrainProfileId && <TerrainProfileTag terrainProfileId={terrainProfileId} />}
        {selectedTracks.map(trackId => <TrackTag key={trackId} trackId={trackId} />)}
      </TagList>
    </div>
  )
}

export default Tagbar
