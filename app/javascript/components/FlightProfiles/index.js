import React from 'react'

import Settings from './Settings'
import Charts from './Charts'
import { Container, SettingsContainer, ChartsAreaContainer } from './elements'

const FlightProfiles = () => {
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
