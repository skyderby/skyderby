import React, { useMemo } from 'react'

import { useI18n } from 'components/TranslationsProvider'
import { useTrackPointsQuery } from 'api/tracks/points'
import TrackCharts from 'components/TrackCharts/CombinedChart'
import Highchart from 'components/Highchart'
import Modal from 'components/ui/Modal'
import Indicators from './Indicators'
import {
  buildAccuracySeries,
  findResultWindow,
  findPositionForAltitude,
  findPlotbandPosition
} from './utils'
import styles from './styles.module.scss'
import TrackViewPreferencesProvider from 'components/TrackViewPreferences'
import { Result, SpeedSkydivingCompetition } from 'api/speedSkydivingCompetitions'

const breakoffAltitude = 1707 // 5600 ft
const windowHeight = 2256 // 7400 ft

type ChartsProps = {
  event: SpeedSkydivingCompetition
  result: Result
  deleteResult: () => unknown
  hide: () => unknown
  tabBar: JSX.Element | null
}

const Charts = ({
  event,
  result,
  deleteResult,
  hide,
  tabBar
}: ChartsProps): JSX.Element => {
  const { t } = useI18n()
  const { data: points = [], isLoading } = useTrackPointsQuery(result.trackId, {
    originalFrequency: true
  })

  const { exitAltitude, windowStartTime, windowEndTime } = result

  const windowEndAltitude = Math.max(exitAltitude - windowHeight, breakoffAltitude)

  const plotLineValue = isLoading
    ? null
    : findPositionForAltitude(points, windowEndAltitude)

  const plotBandPosition =
    isLoading || !Number.isFinite(result.result)
      ? null
      : findPlotbandPosition(points[0], result)

  const resultWindow = useMemo(
    () =>
      isLoading ? undefined : findResultWindow(points, windowStartTime, windowEndTime),
    [points, isLoading, windowStartTime, windowEndTime]
  )

  const accuracySeries = useMemo(() => buildAccuracySeries(points, windowEndAltitude), [
    points,
    windowEndAltitude
  ])

  return (
    <>
      <Modal.Body>
        {tabBar}
        {tabBar && <hr />}

        <TrackViewPreferencesProvider>
          <Indicators result={result} resultWindow={resultWindow} />

          <hr />

          <div className={styles.trackChart}>
            <TrackCharts points={points} additionalSeries={[accuracySeries]}>
              {chart => (
                <>
                  {plotLineValue && (
                    <Highchart.Plotline
                      chart={chart}
                      id="windowEnd"
                      value={plotLineValue}
                      color="red"
                      label={{
                        text: `End of window - ${windowEndAltitude.toFixed()} ${t(
                          'units.m'
                        )}`,
                        style: { color: 'red' },
                        y: 100
                      }}
                    />
                  )}
                  {plotBandPosition && (
                    <Highchart.Plotband
                      id="result"
                      chart={chart}
                      color="rgba(0, 150, 0, 0.25)"
                      zIndex={8}
                      label={{
                        text: `Best speed: ${result.result.toFixed(2)} ${t('units.kmh')}`,
                        rotation: 90,
                        textAlign: 'left',
                        y: 100
                      }}
                      {...plotBandPosition}
                    />
                  )}
                </>
              )}
            </TrackCharts>
          </div>
        </TrackViewPreferencesProvider>
      </Modal.Body>
      <Modal.Footer spaceBetween={event.permissions.canEdit}>
        {event.permissions.canEdit && (
          <button className={styles.deleteButton} onClick={deleteResult}>
            {t('general.delete')}
          </button>
        )}
        <button className={styles.defaultButton} onClick={hide}>
          {t('general.back')}
        </button>
      </Modal.Footer>
    </>
  )
}

export default Charts
