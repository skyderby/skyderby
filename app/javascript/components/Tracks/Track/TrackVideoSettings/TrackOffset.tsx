import React, { useCallback, useMemo } from 'react'
import {
  ChartClickEventObject,
  OptionsZoomTypeValue,
  PointerEventObject,
  SeriesClickEventObject
} from 'highcharts'
import { Field } from 'formik'

import { useTrackPointsQuery } from 'api/tracks/points'
import { useI18n } from 'components/TranslationsProvider'
import AltitudeChart from 'components/AltitudeChart'
import PlotLine from 'components/Highchart/Plotline'
import styles from './styles.module.scss'

type TrackOffsetProps = {
  trackId: number
  setFieldValue: (name: string, value: string | number | undefined) => void
  value: number | undefined
}

const TrackOffset = ({
  trackId,
  setFieldValue,
  value
}: TrackOffsetProps): JSX.Element => {
  const { t } = useI18n()
  const { data: points = [] } = useTrackPointsQuery(trackId, { trimmed: false })

  const handleChartClick = useCallback(
    (event: PointerEventObject) => {
      const chartX = (event as ChartClickEventObject).xAxis[0].value
      const offset = Math.round(chartX * 10) / 10

      setFieldValue('trackOffset', offset)
    },
    [setFieldValue]
  )

  const handleSeriesClick = useCallback(
    (event: SeriesClickEventObject) => {
      const chartX = event.point?.x
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
        zoomType: 'x' as OptionsZoomTypeValue
      },
      plotOptions: {
        series: {
          events: {
            click: handleSeriesClick
          }
        }
      }
    }),
    [handleChartClick, handleSeriesClick]
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

export default TrackOffset
