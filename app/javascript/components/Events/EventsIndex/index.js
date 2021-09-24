import React from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'

import { useEventsQuery, mapParamsToUrl, extractParamsFromUrl } from 'api/hooks/events'
import { useI18n } from 'components/TranslationsProvider'
import AppShell from 'components/AppShell'
import Pagination from 'components/Pagination'
import PlusIcon from 'icons/plus'
import Item from './Item'
import styles from './styles.module.scss'

const EventsIndex = ({ location }) => {
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

EventsIndex.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string
  }).isRequired
}

export default EventsIndex
