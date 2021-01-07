import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import ChevronLeftIcon from 'icons/chevron-left.svg'
import Map from './Map'
import CompetitorsList from './CompetitorsList'

import styles from './styles.module.scss'

const RoundMap = ({ discipline, number, eventId, eventName }) => {
  const { t } = useI18n()

  const headerText =
    discipline && number && `// ${t('disciplines.' + discipline)} - ${number}`

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to={`/events/${eventId}`} className={styles.backLink}>
          <ChevronLeftIcon />
          &nbsp;
          {eventName}
        </Link>
        {headerText}
      </div>
      <section className={styles.content}>
        <Map />
        <CompetitorsList />
      </section>
    </div>
  )
}

RoundMap.propTypes = {
  discipline: PropTypes.oneOf(['distance', 'speed', 'time']),
  number: PropTypes.number.isRequired,
  eventId: PropTypes.number.isRequired,
  eventName: PropTypes.string.isRequired
}

export default RoundMap
