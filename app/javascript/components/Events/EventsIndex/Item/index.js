import React from 'react'
import { Link } from 'react-router-dom'
import { getDate } from 'date-fns'
import cx from 'clsx'
import PropTypes from 'prop-types'

import LocationIcon from 'icons/location.svg'
import SuitIcon from 'icons/suit.svg'
import { useI18n } from 'components/TranslationsProvider'
import PlaceLabel from 'components/PlaceLabel'
import styles from './styles.module.scss'
import { usePlaceQuery } from 'api/hooks/places'
import { useCountryQuery } from 'api/hooks/countries'

const types = {
  performanceCompetition: 'GPS Performance',
  hungaryBoogie: 'Hungary Boogie',
  tournament: 'Single elimination',
  competitionSeries: 'Cumulative scoreboard'
}

const eventUrl = ({ type, id }) => {
  const prefixes = {
    performanceCompetition: 'performance',
    hungaryBoogie: 'boogie',
    tournament: 'tournament',
    competitionSeries: 'series'
  }

  return `/events/${prefixes[type]}/${id}`
}

const Item = ({ event }) => {
  const { t, formatDate } = useI18n()
  const competitorsCount = Object.entries(event.competitorsCount)

  return (
    <Link to={eventUrl(event)} className={styles.container}>
      <div>
        <div className={cx(styles.date, event.active && styles.active)}>
          {getDate(new Date(event.startsAt))}

          <span>{formatDate(new Date(event.startsAt), 'MMM yy')}</span>
        </div>

        {event.isOfficial && <div className={styles.official}>official</div>}
      </div>

      <div className={styles.eventInfo}>
        <div className={styles.title}>{event.name}</div>
        {event.placeId && (
          <div className={styles.description}>
            <PlaceLabel withIcon placeId={event.placeId} />
          </div>
        )}
        {competitorsCount.length > 0 && (
          <div className={styles.description}>
            <SuitIcon className={styles.suitIcon} />

            {competitorsCount.map(([category, count], idx, arr) => (
              <>
                <span>
                  {category} - {count}
                </span>
                {idx < arr.length - 1 && <span className={styles.separator}>{'//'}</span>}
              </>
            ))}
          </div>
        )}

        <hr />

        <div className={styles.description}>Type: {types[event.type]}</div>

        {event.rangeFrom && event.rangeTo && (
          <div className={styles.description}>
            Competition window: {event.rangeFrom} - {event.rangeTo} {t('units.m')}
          </div>
        )}
      </div>
    </Link>
  )
}

Item.propTypes = {
  event: PropTypes.shape({
    active: PropTypes.bool.isRequired,
    competitorsCount: PropTypes.objectOf(PropTypes.number).isRequired,
    isOfficial: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    placeId: PropTypes.number,
    rangeFrom: PropTypes.number,
    rangeTo: PropTypes.number,
    type: PropTypes.oneOf([
      'performanceCompetition',
      'hungaryBoogie',
      'tournament',
      'competitionSeries'
    ]).isRequired,
    startsAt: PropTypes.string.isRequired
  })
}

export default Item
