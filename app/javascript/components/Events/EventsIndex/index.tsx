import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import { useEventsQuery, mapParamsToUrl, extractParamsFromUrl } from 'api/events'
import { useI18n } from 'components/TranslationsProvider'
import Pagination from 'components/Pagination'
import PlusIcon from 'icons/plus'
import Item from './Item'
import styles from './styles.module.scss'

const EventsIndex = (): JSX.Element => {
  const { t } = useI18n()
  const location = useLocation()
  const { page } = extractParamsFromUrl(location.search)
  const { data } = useEventsQuery({ page })
  const events = data?.items || []
  const pagination = { page: data?.currentPage, totalPages: data?.totalPages }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t('application.header.competitions')}</h1>

      <AnimatePresence exitBeforeEnter>
        <React.Fragment key={events.map(e => e.id).join(',')}>
          {events.map((event, idx) => (
            <Item key={`${event.type}/${event.id}`} event={event} delayIndex={idx} />
          ))}
        </React.Fragment>
      </AnimatePresence>

      <Pagination buildUrl={mapParamsToUrl} {...pagination} />

      {data?.permissions?.canCreate && (
        <Link to="new" className={styles.fab}>
          <PlusIcon />
        </Link>
      )}
    </div>
  )
}

export default EventsIndex
