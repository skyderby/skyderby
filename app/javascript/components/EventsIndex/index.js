import React from 'react'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import Pagination from 'components/Pagination'
import Item from './Item'
import styles from './styles.module.scss'

const EventsIndex = ({ events, pagination, buildUrl }) => {
  const { t } = useI18n()

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t('application.header.competitions')}</h1>

      {events.map(event => (
        <Item key={`${event.type}/${event.id}`} event={event} />
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
