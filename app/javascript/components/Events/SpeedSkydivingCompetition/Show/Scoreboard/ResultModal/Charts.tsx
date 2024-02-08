import React, { useMemo } from 'react'

import { useTrackPointsQuery } from 'api/tracks/points'
import { Result, SpeedSkydivingCompetition } from 'api/speedSkydivingCompetitions'
import { useI18n } from 'components/TranslationsProvider'
import TrackCharts from 'components/TrackCharts/CombinedChart'
import Highchart from 'components/Highchart'
import Modal from 'components/ui/Modal'
import Indicators from './Indicators'
import { buildAccuracySeries, findResultWindow, findPlotbandPosition } from './utils'
import { findPositionForAltitude } from 'components/Events/utils'
import TrackViewPreferencesProvider from 'components/TrackViewPreferences'
import styles from './styles.module.scss'

const breakoffAltitude = 1707 // 5600 ft
const windowHeight = 2256 // 7400 ft

type ChartsProps = {
  event: SpeedSkydivingCompetition
  result: Result
  hide?: () => void
  deleteResult?: () => void
  tabBar?: JSX.Element | null
}

const Charts = ({
  event,
  result,
  hide,
  deleteResult,
  tabBar = null
}: ChartsProps): JSX.Element => {
  const { t } = useI18n()
  const { data: points = [] } = useTrackPointsQuery(result.trackId, {
    originalFrequency: true
  })

  const { exitAltitude, windowStartTime, windowEndTime } = result

  const windowEndAltitude = Math.max(exitAltitude - windowHeight, breakoffAltitude)

  const plotLineValue = findPositionForAltitude(points, windowEndAltitude)

  const plotBandPosition = !Number.isFinite(result.result)
    ? null
    : findPlotbandPosition(points[0], result)

  const resultWindow = useMemo(
    () => findResultWindow(points, windowStartTime, windowEndTime),
    [points, windowStartTime, windowEndTime]
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
      {(hide || deleteResult) && (
        <Modal.Footer spaceBetween={event.permissions.canEdit}>
          {event.permissions.canEdit && deleteResult && (
            <button className={styles.deleteButton} onClick={deleteResult}>
              {t('general.delete')}
            </button>
          )}
          {hide && (
            <button className={styles.defaultButton} onClick={hide}>
              {t('general.back')}
            </button>
          )}
        </Modal.Footer>
      )}
    </>
  )
}

export default Charts
