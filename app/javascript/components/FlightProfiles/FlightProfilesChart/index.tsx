import React from 'react'

import Highchart from 'components/Highchart'
import { colorByIndex } from 'utils/colors'
import useChartOptions from './useChartOptions'
import FlightProfile from './FlightProfile'
import TerrainProfile from './TerrainProfile'
import usePageParams from 'components/FlightProfiles/usePageParams'

type FlightProfilesChartProps = {
  straightLine: boolean
  onZoomChange: (
    zoom: {
      min: number
      max: number
    } | null
  ) => unknown
}

const FlightProfilesChart = ({
  straightLine,
  onZoomChange
}: FlightProfilesChartProps): JSX.Element => {
  const options = useChartOptions(onZoomChange)

  const {
    params: { selectedTracks, selectedTerrainProfile, additionalTerrainProfiles }
  } = usePageParams()

  return (
    <Highchart autoResize options={options}>
      {chart => (
        <>
          {selectedTracks.map((trackId, idx) => (
            <React.Suspense fallback={null} key={trackId}>
              <FlightProfile
                chart={chart}
                trackId={trackId}
                straightLine={straightLine}
                color={colorByIndex(idx)}
              />
            </React.Suspense>
          ))}
          {selectedTerrainProfile && (
            <TerrainProfile
              chart={chart}
              terrainProfileId={selectedTerrainProfile}
              color="#b88e8d"
            />
          )}

          {additionalTerrainProfiles.map((id, idx) => (
            <TerrainProfile
              key={id}
              chart={chart}
              terrainProfileId={id}
              color={colorByIndex(idx)}
            />
          ))}
        </>
      )}
    </Highchart>
  )
}

export default FlightProfilesChart
