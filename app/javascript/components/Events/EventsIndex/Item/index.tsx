import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getDate } from 'date-fns'
import cx from 'clsx'

import SuitIcon from 'icons/suit.svg'
import { useI18n } from 'components/TranslationsProvider'
import PlaceLabel from 'components/PlaceLabel'
import styles from './styles.module.scss'
import { EventIndexRecord, EventType } from 'api/events'

const types: Record<EventType, string> = {
  performanceCompetition: 'GPS Performance',
  hungaryBoogie: 'Hungary Boogie',
  tournament: 'Single elimination',
  competitionSeries: 'Cumulative scoreboard',
  speedSkydivingCompetition: 'Speed Skydiving',
  speedSkydivingCompetitionSeries: 'Speed Skydiving Cumulative scoreboard'
}

const eventUrl = ({ type, id }: { type: EventType; id: number }) => {
  const prefixes = {
    performanceCompetition: 'performance',
    hungaryBoogie: 'boogie',
    tournament: 'tournament',
    competitionSeries: 'series',
    speedSkydivingCompetition: 'speed_skydiving',
    speedSkydivingCompetitionSeries: 'speed_skydiving_series'
  }

  return `/events/${prefixes[type]}/${id}`
}

const MotionLink = motion(Link)

type ItemProps = {
  event: EventIndexRecord
  delayIndex: number
}

const Item = ({ event, delayIndex }: ItemProps): JSX.Element => {
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
                <span>{`${category} - ${count}`}</span>
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

export default Item
