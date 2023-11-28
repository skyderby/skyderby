import React from 'react'
import { Link, useLocation } from 'react-router-dom'

import useEventsQuery, { mapParamsToUrl, extractParamsFromUrl } from 'api/events'
import { useI18n } from 'components/TranslationsProvider'
import Pagination from 'components/Pagination'
import PlusIcon from 'icons/plus'
import Item from './Item'
import styles from './styles.module.scss'

const EventsIndex = (): JSX.Element => {
  const { t } = useI18n()
  const location = useLocation()
  const { page } = extractParamsFromUrl(location.search)
  const {
    data: { items: events, currentPage, totalPages, permissions }
  } = useEventsQuery({ page })

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t('application.header.competitions')}</h1>

      {events.map((event, idx) => (
        <Item key={`${event.type}/${event.id}`} event={event} delayIndex={idx} />
      ))}

      <Pagination buildUrl={mapParamsToUrl} page={currentPage} totalPages={totalPages} />

      {permissions.canCreate && (
        <Link to="new" className={styles.fab}>
          <PlusIcon />
        </Link>
      )}
    </div>
  )
}

export default EventsIndex
