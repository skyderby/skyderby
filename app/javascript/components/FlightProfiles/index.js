import React, { useState } from 'react'

import { usePageContext } from 'components/PageContext'

import FlightProfilesChart from './FlightProfilesChart'
import TerrainClearanceChart from './TerrainClearanceChart'
import Tagbar from './Tagbar'
import TrackList from './TrackList'
import TerrainProfileSelect from './TerrainProfileSelect'
import {
  Container,
  SettingsContainer,
  ChartsContainer,
  TerrainProfileSelectContainer
} from './elements'

const FlightProfiles = () => {
  const [zoomLevel, setZoomLevel] = useState()
  const {
    selectedTracks,
    selectedTerrainProfile,
    setSelectedTerrainProfile
  } = usePageContext()

  return (
    <Container>
      <SettingsContainer>
        <TrackList />

        <TerrainProfileSelectContainer>
          <TerrainProfileSelect
            onChange={option => setSelectedTerrainProfile(option?.value || null)}
          />
        </TerrainProfileSelectContainer>
      </SettingsContainer>

      <ChartsContainer>
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
        />
        <div>
          <TerrainClearanceChart
            zoomLevel={zoomLevel}
            selectedTracks={selectedTracks}
            selectedTerrainProfile={selectedTerrainProfile}
          />
        </div>
      </ChartsContainer>
    </Container>
  )
}

export default FlightProfiles
