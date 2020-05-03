import React from 'react'
import { useSelector } from 'react-redux'

import { usePageContext } from 'components/PageContext'
import { selectWindData } from 'redux/tracks/windData'
import { Table } from './elements'

const TrackWindData = () => {
  const { trackId } = usePageContext()
  const windData = useSelector(state => selectWindData(state, trackId))

  return (
    <Table>
      <thead>
        <tr>
          <th>{I18n.t('weather_datum.altitude')}</th>
          <th>{I18n.t('weather_datum.wind_speed')}</th>
          <th>{I18n.t('weather_datum.wind_direction')}</th>
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
    </Table>
  )
}

export default TrackWindData
