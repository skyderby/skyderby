import React, { useState } from 'react'

import FlightProfilesChart from './FlightProfilesChart'
import TerrainClearanceChart from './TerrainClearanceChart'
import { FlightProfilesChartContainer, TerrainClearanceChartContainer } from './elements'

const Charts = () => {
  const [zoomLevel, setZoomLevel] = useState()

  return (
    <>
      <FlightProfilesChartContainer>
        <FlightProfilesChart onZoomChange={setZoomLevel}/>
      </FlightProfilesChartContainer>
      <TerrainClearanceChartContainer>
        <TerrainClearanceChart zoomLevel={zoomLevel} />
      </TerrainClearanceChartContainer>
    </>
  )
}

export default Charts
