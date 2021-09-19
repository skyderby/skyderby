import React, { useMemo } from 'react'
import { useHistory, match } from 'react-router-dom'
import { Location } from 'history'

import { useTrackQuery } from 'api/hooks/tracks'
import { useTrackPointsQuery } from 'api/hooks/tracks/points'
import { useTrackWindDataQuery } from 'api/hooks/tracks/windData'
import { subtractWind } from 'utils/windCancellation'
import { cropPoints } from 'utils/pointsFilter'
import RangeSlider from 'components/RangeSlider'
import TrackViewPreferencesProvider from 'components/TrackViewPreferences'
import PageContainer from 'components/Tracks/Track/PageContainer'
import Summary from './Summary'
import Charts from 'components/TrackCharts'
import ViewSettings from './ViewSettings'
import RangeShortcuts from './RangeShortcuts'
import { getMinMaxAltitude } from './minMaxAltitude'

type TrackInsightsProps = {
  match: match<{ id: string }>
  location: Location
}

const TrackInsights = ({ match, location }: TrackInsightsProps): JSX.Element => {
  const trackId = Number(match.params.id)
  const history = useHistory()
  const { data: track } = useTrackQuery(trackId)
  const { data: points = [] } = useTrackPointsQuery(trackId)
  const { data: windData = [] } = useTrackWindDataQuery(trackId)

  const [minAltitude, maxAltitude] = useMemo(() => getMinMaxAltitude(points), [points])

  const urlParams = new URLSearchParams(location.search)
  const altitudeFromParam = urlParams.get('f') && Number(urlParams.get('f'))
  const altitudeToParam = urlParams.get('t') && Number(urlParams.get('t'))
  const straightLine = urlParams.get('straight-line') === 'true'

  const setStraightLine = (value: boolean): void => {
    const params = new URLSearchParams(location.search)
    if (value) {
      params.set('straight-line', 'true')
    } else {
      params.delete('straight-line')
    }
    history.replace({ pathname: location.pathname, search: params.toString() })
  }

  const altitudeFrom = altitudeFromParam
    ? Math.min(maxAltitude, altitudeFromParam)
    : maxAltitude

  const altitudeTo = altitudeToParam
    ? Math.max(minAltitude, altitudeToParam)
    : minAltitude

  const handleAltitudeRangeChange = ([valueFrom, valueTo]: readonly number[]): void => {
    if (altitudeFrom === valueFrom && altitudeTo === valueTo) return

    const params = new URLSearchParams(location.search)
    if (valueFrom === maxAltitude) {
      params.delete('f')
    } else {
      params.set('f', String(valueFrom))
    }
    if (valueTo === minAltitude) {
      params.delete('t')
    } else {
      params.set('t', String(valueTo))
    }

    history.replace({ pathname: location.pathname, search: params.toString() })
  }

  const selectedPoints = useMemo(() => cropPoints(points, altitudeFrom, altitudeTo), [
    points,
    altitudeFrom,
    altitudeTo
  ])

  const zeroWindPoints = useMemo(() => subtractWind(selectedPoints, windData), [
    selectedPoints,
    windData
  ])

  return (
    <TrackViewPreferencesProvider>
      <PageContainer>
        <ViewSettings straightLine={straightLine} setStraightLine={setStraightLine} />

        <Summary
          selectedPoints={selectedPoints}
          zeroWindPoints={zeroWindPoints}
          straightLine={straightLine}
        />

        <hr />

        <RangeSlider
          reversed
          domain={[minAltitude, maxAltitude]}
          values={[altitudeTo, altitudeFrom]}
          onChange={handleAltitudeRangeChange}
          step={50}
        />

        <RangeShortcuts
          activity={track?.kind}
          altitudeRange={[minAltitude, maxAltitude]}
          selectedAltitudeRange={[altitudeFrom, altitudeTo]}
          onChange={handleAltitudeRangeChange}
        />

        <Charts points={selectedPoints} zeroWindPoints={zeroWindPoints} />
      </PageContainer>
    </TrackViewPreferencesProvider>
  )
}

export default TrackInsights
