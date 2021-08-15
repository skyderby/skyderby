import React, { useMemo } from 'react'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import { useTrackPointsQuery } from 'api/hooks/tracks/points'
import TrackCharts from 'components/TrackCharts/CombinedChart'
import Highchart from 'components/Highchart'
import Modal from 'components/ui/Modal'
import {
  buildAccuracySeries,
  findResultWindow,
  findPositionForAltitude,
  findPlotbandPosition
} from './utils'
import styles from './styles.module.scss'

const breakoffAltitude = 1707 // 5600 ft
const windowHeight = 2256 // 7400 ft

const Charts = ({ event, result, deleteResult, hide, tabBar }) => {
  const { t } = useI18n()
  const { data: points = [], isLoading } = useTrackPointsQuery(result.trackId, {
    originalFrequency: true
  })

  const { exitAltitude, windowStartTime, windowEndTime } = result

  const windowEndAltitude = Math.max(exitAltitude - windowHeight, breakoffAltitude)

  const plotLineValue = isLoading
    ? null
    : findPositionForAltitude(points, windowEndAltitude)

  const plotBandPosition = isLoading
    ? null
    : findPlotbandPosition(points[0], windowStartTime, windowEndTime)

  const resultWindow = useMemo(
    () => (isLoading ? null : findResultWindow(points, windowStartTime, windowEndTime)),
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

        <div className={styles.indicators}>
          <div className={styles.indicatorTitle}>Result</div>
          <div className={styles.indicatorValue}>
            {result.result.toFixed(2)} {t('units.kmh')}
          </div>
          <div className={styles.indicatorTitle}>Exit Altitude</div>
          <div className={styles.indicatorValue}>
            {result.exitAltitude} {t('units.m')}
          </div>
          <div className={styles.indicatorTitle}>Window</div>
          <div className={styles.indicatorValue}>
            {resultWindow?.join(' - ') || '---'} {t('units.m')}
          </div>
        </div>

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

Charts.propTypes = {
  event: PropTypes.shape({
    permissions: PropTypes.shape({
      canEdit: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired,
  result: PropTypes.shape({
    trackId: PropTypes.number.isRequired,
    exitAltitude: PropTypes.number.isRequired,
    windowStartTime: PropTypes.string.isRequired,
    windowEndTime: PropTypes.string.isRequired,
    result: PropTypes.number.isRequired
  }).isRequired,
  deleteResult: PropTypes.func.isRequired,
  hide: PropTypes.func.isRequired,
  tabBar: PropTypes.object
}

export default Charts