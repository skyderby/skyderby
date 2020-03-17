import React from 'react'

import FlightProfilesChart from './FlightProfilesChart'
import TerrainClearanceChart from './TerrainClearanceChart'
import { FlightProfilesChartContainer, TerrainClearanceChartContainer } from './elements'

const Charts = () => {
  return (
    <>
      <FlightProfilesChartContainer>
        <FlightProfilesChart />
      </FlightProfilesChartContainer>
      <TerrainClearanceChartContainer>
        <TerrainClearanceChart />
      </TerrainClearanceChartContainer>
    </>
  )
}

export default Charts
