import React from 'react'
import { parseISO, differenceInMilliseconds } from 'date-fns'
import PropTypes from 'prop-types'

import { useTrackPointsQuery } from 'api/hooks/tracks/points'
import TrackCharts from 'components/TrackCharts/CombinedChart'
import Highchart from 'components/Highchart'
import Modal from 'components/ui/Modal'
import { useI18n } from 'components/TranslationsProvider'
import styles from './styles.module.scss'

const breakoffAltitude = 1707 // 5600 ft
const windowHeight = 2256 // 7400 ft

const findPositionForAltitude = (points, altitude) => {
  const idx = points.findIndex(point => point.altitude <= altitude)
  const firstPoint = points[idx]
  const secondPoint = points[idx + 1]

  const flTime =
    firstPoint.flTime +
    ((secondPoint.flTime - firstPoint.flTime) /
      (firstPoint.altitude - secondPoint.altitude)) *
      (firstPoint.altitude - altitude)

  return flTime - points[0].flTime
}

const findPlotbandPosition = (firstPoint, windowStart, windowEnd) => {
  const windowStartTime = parseISO(windowStart)
  const windowEndTime = parseISO(windowEnd)

  return {
    from: differenceInMilliseconds(windowStartTime, firstPoint.gpsTime) / 1000,
    to: differenceInMilliseconds(windowEndTime, firstPoint.gpsTime) / 1000
  }
}

const Charts = ({ event, result, deleteResult, hide, tabBar }) => {
  const { t } = useI18n()
  const { data: points = [], isLoading } = useTrackPointsQuery(result.trackId, {
    originalFrequency: true
  })

  if (isLoading) return null

  const windowEndAltitude = Math.max(result.exitAltitude - windowHeight, breakoffAltitude)
  const plotLineValue = findPositionForAltitude(points, windowEndAltitude)
  const plotBandPosition = findPlotbandPosition(
    points[0],
    result.windowStartTime,
    result.windowEndTime
  )

  return (
    <>
      <Modal.Body>
        {tabBar}

        <hr />

        <TrackCharts points={points}>
          {chart => (
            <>
              <Highchart.Plotline
                chart={chart}
                id="windowEnd"
                value={plotLineValue}
                color="red"
                label={{
                  text: `End of window - ${windowEndAltitude.toFixed()} ${t('units.m')}`,
                  style: { color: 'red' },
                  y: 100
                }}
              />
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
            </>
          )}
        </TrackCharts>
      </Modal.Body>
      <Modal.Footer spaceBetween>
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
  hide: PropTypes.func.isRequired
}

export default Charts
