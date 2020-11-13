import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import Pagination from 'components/Pagination'

import styles from './styles.module.scss'

const EventsIndex = ({ events, pagination, buildUrl }) => {
  const { t } = useI18n()

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t('application.header.competitions')}</h1>

      {events &&
        events.map(el => (
          <Link key={el.path} to={el.path}>
            {el.name}
          </Link>
        ))}

      <Pagination buildUrl={buildUrl} {...pagination} />
    </div>
  )
}

EventsIndex.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  pagination: PropTypes.shape({
    page: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired
  }).isRequired,
  buildUrl: PropTypes.func.isRequired
}

export default EventsIndex
