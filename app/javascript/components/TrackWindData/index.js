import React from 'react'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import TrackShowContainer from 'components/TrackShowContainer'
import { useTrackWindDataQuery } from 'api/hooks/tracks/windData'
import styles from './styles.module.scss'

const TrackWindData = ({ match }) => {
  const trackId = Number(match.params.id)
  const { t } = useI18n()
  const { data: windData = [] } = useTrackWindDataQuery(trackId)

  return (
    <TrackShowContainer shrinkToContent>
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
    </TrackShowContainer>
  )
}

TrackWindData.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default TrackWindData
