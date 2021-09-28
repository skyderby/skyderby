import React from 'react'
import { Link } from 'react-router-dom'
import { Location } from 'history'
import { AnimatePresence } from 'framer-motion'

import { useEventsQuery, mapParamsToUrl, extractParamsFromUrl } from 'api/hooks/events'
import { useI18n } from 'components/TranslationsProvider'
import AppShell from 'components/AppShell'
import Pagination from 'components/Pagination'
import PlusIcon from 'icons/plus'
import Item from './Item'
import styles from './styles.module.scss'

type EventsIndexProps = {
  location: Location
}

const EventsIndex = ({ location }: EventsIndexProps): JSX.Element => {
  const { t } = useI18n()
  const { page } = extractParamsFromUrl(location.search)
  const { data } = useEventsQuery({ page })
  const events = data?.items || []
  const pagination = { page: data?.currentPage, totalPages: data?.totalPages }

  return (
    <AppShell>
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
          <Link to="/events/new" className={styles.fab}>
            <PlusIcon />
          </Link>
        )}
      </div>
    </AppShell>
  )
}

export default EventsIndex
