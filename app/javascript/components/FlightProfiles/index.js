import React, { useState } from 'react'

import Settings from './Settings'
import Charts from './Charts'
import { Container, SettingsContainer, ChartsAreaContainer } from './elements'

const FlightProfiles = ({
  selectedTerrainProfile: initialTerrainProfile,
  selectedTracks: initialSelectedTracks = [],
  straightLine: initialStraightLine
}) => {
  const [straightLine, setStraightLine] = useState(initialStraightLine)
  const [selectedTracks, setSelectedTracks] = useState(initialSelectedTracks)
  const [selectedTerrainProfile, setSelectedTerrainProfile] = useState(initialTerrainProfile)

  return (
    <Container>
      <SettingsContainer>
        <Settings />
      </SettingsContainer>
      <ChartsAreaContainer>
        <Charts />
      </ChartsAreaContainer>
    </Container>
  )
}

export default FlightProfiles
