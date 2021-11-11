import React from 'react'
import { match } from 'react-router-dom'

import { useI18n } from 'components/TranslationsProvider'
import PageContainer from 'components/Tracks/Track/PageContainer'
import { useTrackWindDataQuery } from 'api/tracks/windData'
import styles from './styles.module.scss'

type TrackWindDataProps = {
  match: match<{ id: string }>
}

const TrackWindData = ({ match }: TrackWindDataProps): JSX.Element => {
  const trackId = Number(match.params.id)
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
