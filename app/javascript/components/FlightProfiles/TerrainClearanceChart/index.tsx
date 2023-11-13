import React from 'react'

import Highchart from 'components/Highchart'
import { colorByIndex } from 'utils/colors'
import useChartOptions from './useChartOptions'
import PlaceholderChart from './PlaceholderChart'
import TerrainClearance from './TerrainClearance'

type TerrainClearanceChartProps = {
  selectedTracks: number[]
  selectedTerrainProfile: number | null
  straightLine: boolean
  zoomLevel: null | {
    min: number
    max: number
  }
}

const TerrainClearanceChart = ({
  selectedTracks,
  selectedTerrainProfile,
  straightLine,
  zoomLevel
}: TerrainClearanceChartProps): JSX.Element => {
  const options = useChartOptions(zoomLevel)

  if (!selectedTerrainProfile) {
    return <PlaceholderChart text={'Select terrain profile to view this chart'} />
  }

  return (
    <Highchart autoResize options={options}>
      {chart => (
        <>
          <Highchart.Series chart={chart} type="spline" data={[]} />
          {selectedTracks.map((trackId, idx) => (
            <React.Suspense fallback={null} key={trackId}>
              <TerrainClearance
                chart={chart}
                trackId={trackId}
                terrainProfileId={selectedTerrainProfile}
                color={colorByIndex(idx)}
                straightLine={straightLine}
              />
            </React.Suspense>
          ))}
        </>
      )}
    </Highchart>
  )
}

export default TerrainClearanceChart
