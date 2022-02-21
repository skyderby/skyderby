import React from 'react'
import Header from './Header'
import styles from './styles.module.scss'
import { useSpeedSkydivingCompetitionSeriesQuery } from 'api/speedSkydivingCompetitionSeries'
import { useParams } from 'react-router-dom'

const Show = () => {
  const params = useParams()
  const eventId = Number(params.eventId)
  const { data: event } = useSpeedSkydivingCompetitionSeriesQuery(eventId)

  if (!event) return null

  return (
    <div className={styles.container}>
      <Header event={event} />
    </div>
  )
}

export default Show
