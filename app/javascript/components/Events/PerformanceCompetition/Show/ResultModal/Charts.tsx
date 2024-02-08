import React from 'react'
import { useTrackPointsQuery } from 'api/tracks/points'
import Highchart from 'components/Highchart'
import { PerformanceCompetition, Result } from 'api/performanceCompetitions'
import TrackCharts from 'components/TrackCharts/CombinedChart'
import Modal from 'components/ui/Modal'
import TrackViewPreferencesProvider from 'components/TrackViewPreferences'
import { findPositionForAltitude } from 'components/Events/utils'
import styles from './styles.module.scss'
import { useI18n } from 'components/TranslationsProvider'

type ChartsProps = {
  result: Result
  event: PerformanceCompetition
  hide: () => void
  deleteResult: () => void
  tabBar: JSX.Element
}

const Charts = ({
  result,
  event,
  hide,
  deleteResult,
  tabBar
}: ChartsProps): JSX.Element => {
  const { t } = useI18n()
  const { data: points = [] } = useTrackPointsQuery(result.trackId, {
    originalFrequency: true
  })

  const windowStartValue = findPositionForAltitude(points, event.rangeFrom)
  const windowEndValue = findPositionForAltitude(points, event.rangeTo)

  return (
    <>
      <Modal.Body>
        <TrackViewPreferencesProvider>
          {tabBar}

          <hr />

          <div className={styles.trackChart}>
            <TrackCharts points={points}>
              {chart => (
                <>
                  {windowStartValue && (
                    <Highchart.Plotline
                      chart={chart}
                      id="windowStart"
                      value={windowStartValue}
                      color="red"
                      label={{
                        text: `Start of window - ${event.rangeFrom.toFixed()} ${t(
                          'units.m'
                        )}`,
                        style: { color: 'red' },
                        y: 70
                      }}
                    />
                  )}
                  {windowEndValue && (
                    <Highchart.Plotline
                      chart={chart}
                      id="windowEnd"
                      value={windowEndValue}
                      color="red"
                      label={{
                        text: `End of window - ${event.rangeTo.toFixed()} ${t(
                          'units.m'
                        )}`,
                        style: { color: 'red' },
                        y: 70
                      }}
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
