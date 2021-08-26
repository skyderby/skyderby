import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getDate } from 'date-fns'
import cx from 'clsx'
import PropTypes from 'prop-types'

import SuitIcon from 'icons/suit.svg'
import { useI18n } from 'components/TranslationsProvider'
import PlaceLabel from 'components/PlaceLabel'
import styles from './styles.module.scss'

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
    competitionSeries: 'series',
    speedSkydivingCompetition: 'speed_skydiving'
  }

  return `/events/${prefixes[type]}/${id}`
}

const MotionLink = motion(Link)

const Item = ({ event, delayIndex }) => {
  const { t, formatDate } = useI18n()
  const competitorsCount = Object.entries(event.competitorsCount)

  const animationVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.4, delay: 0.02 * delayIndex } },
    exit: { opacity: 0, transition: { duration: 0.25 } }
  }

  return (
    <MotionLink
      to={eventUrl(event)}
      className={styles.container}
      variants={animationVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
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
              <React.Fragment key={idx}>
                <span>
                  {category} - {count}
                </span>
                {idx < arr.length - 1 && <span className={styles.separator}>{'//'}</span>}
              </React.Fragment>
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
    </MotionLink>
  )
}

Item.propTypes = {
  event: PropTypes.shape({
    active: PropTypes.bool.isRequired,
    competitorsCount: PropTypes.objectOf(PropTypes.number).isRequired,
    isOfficial: PropTypes.bool,
    name: PropTypes.string.isRequired,
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
  }),
  delayIndex: PropTypes.number
}

export default Item
