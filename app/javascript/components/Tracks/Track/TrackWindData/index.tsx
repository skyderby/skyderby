import React from 'react'

import { useI18n } from 'components/TranslationsProvider'
import PageContainer from 'components/Tracks/Track/PageContainer'
import { useTrackWindDataQuery } from 'api/tracks/windData'
import styles from './styles.module.scss'

type TrackWindDataProps = {
  trackId: number
}

const TrackWindData = ({ trackId }: TrackWindDataProps): JSX.Element => {
  const { t } = useI18n()
  const { data: windData = [] } = useTrackWindDataQuery(trackId)

  return (
    <PageContainer shrinkToContent>
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
    </PageContainer>
  )
}

export default TrackWindData
