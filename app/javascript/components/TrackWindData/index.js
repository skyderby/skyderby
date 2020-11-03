import React from 'react'
import { useSelector } from 'react-redux'

import { useI18n } from 'components/TranslationsProvider'
import { usePageContext } from 'components/PageContext'
import { selectWindData } from 'redux/tracks/windData'

import styles from './styles.module.scss'

const TrackWindData = () => {
  const { t } = useI18n()
  const { trackId } = usePageContext()
  const windData = useSelector(state => selectWindData(state, trackId))

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>{t('weather_datum.altitude')}</th>
          <th>{t('weather_datum.wind_speed')}</th>
          <th>{t('weather_datum.wind_direction')}</th>
        </tr>
      </thead>
      <tbody>
        {windData.map(record => (
          <tr key={record.altitude}>
            <td>{record.altitude.toFixed()}</td>
            <td>{record.windSpeed.toFixed(1)}</td>
            <td>{record.windDirection.toFixed()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default TrackWindData
