import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Field } from 'formik'

import { useTrackPointsQuery } from 'api/hooks/tracks/points'
import { useI18n } from 'components/TranslationsProvider'
import AltitudeChart from 'components/AltitudeChart'
import PlotLine from 'components/Highchart/Plotline'
import styles from './styles.module.scss'

const TrackOffset = ({ trackId, setFieldValue, value }) => {
  const { t } = useI18n()
  const { data: points = [] } = useTrackPointsQuery(trackId, { trimmed: false })

  const handleChartClick = useCallback(
    event => {
      const chartX = event.point?.x || event.xAxis[0].value
      const offset = Math.round(chartX * 10) / 10

      setFieldValue('trackOffset', offset)
    },
    [setFieldValue]
  )

  const options = useMemo(
    () => ({
      chart: {
        events: {
          click: handleChartClick
        },
        height: (9 / 16) * 100 + '%',
        zoomType: 'x'
      },
      plotOptions: {
        series: {
          events: {
            click: handleChartClick
          }
        }
      }
    }),
    [handleChartClick]
  )

  const plotLineProps = {
    color: '#FF0000',
    id: 'track-offset',
    width: 2,
    value: Number(value),
    zIndex: 8
  }

  return (
    <div className={styles.section}>
      <div className={styles.description}>
        <h2>{t('activerecord.attributes.track_videos.track_offset')}</h2>
        <p>{t('tracks.videos.form.track_offset_description')}</p>
      </div>
      <div className={styles.controls}>
        <div className={styles.trackChartCard}>
          <AltitudeChart points={points} options={options}>
            {chart => <PlotLine chart={chart} {...plotLineProps} />}
          </AltitudeChart>
        </div>
        <div className={styles.inputContainer}>
          <Field className={styles.input} name="trackOffset" type="number" step="0.1" />
        </div>
      </div>
    </div>
  )
}

TrackOffset.propTypes = {
  trackId: PropTypes.number.isRequired,
  setFieldValue: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}

export default TrackOffset
