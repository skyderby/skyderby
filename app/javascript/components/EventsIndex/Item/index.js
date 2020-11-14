import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getDate } from 'date-fns'
import cx from 'clsx'
import PropTypes from 'prop-types'

import { createPlaceSelector } from 'redux/places'
import LocationIcon from 'icons/location'
import SuitIcon from 'icons/suit'
import { useI18n } from 'components/TranslationsProvider'
import PlaceLabel from 'components/PlaceLabel'
import styles from './styles.module.scss'

const Item = ({ event }) => {
  const { t, formatDate } = useI18n()
  const place = useSelector(createPlaceSelector(event.placeId))
  const competitorsCount = Object.entries(event.competitorsCount)

  const rulesNames = {
    speed_distance_time: 'GPS Performance',
    fai: 'GPS Performance',
    hungary_boogie: 'Hungary Boogie',
    single_elimination: 'Single elimination'
  }

  return (
    <Link to={event.path} className={styles.container}>
      <div>
        <div className={cx(styles.date, event.active && styles.active)}>
          {getDate(new Date(event.startsAt))}

          <span>{formatDate(new Date(event.startsAt), 'MMM yy')}</span>
        </div>

        {event.isOfficial && <div className={styles.official}>official</div>}
      </div>

      <div className={styles.eventInfo}>
        <div className={styles.title}>{event.name}</div>
        {place && (
          <div className={styles.description}>
            <LocationIcon className={styles.placeIcon} />
            <PlaceLabel name={place.name} code={place.country.code} />
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
        <div className={styles.description}>Rules: {rulesNames[event.rules]}</div>
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
    rules: PropTypes.oneOf([
      'speed_distance_time',
      'fai',
      'hungary_boogie',
      'single_elimination'
    ]).isRequired,
    startsAt: PropTypes.string.isRequired
  })
}

export default Item
