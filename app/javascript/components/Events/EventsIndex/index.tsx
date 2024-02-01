import React, { startTransition, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import throttle from 'lodash.throttle'

import useEventsQuery, { mapParamsToUrl } from 'api/events'
import { useI18n } from 'components/TranslationsProvider'
import Pagination from 'components/Pagination'
import PlusIcon from 'icons/plus'
import Item from './Item'
import styles from './styles.module.scss'

const EventsIndex = (): JSX.Element => {
  const { t } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') || 1)
  const searchTerm = searchParams.get('term') || ''

  const handleSearchTermInput = useRef(
    throttle(e => {
      const value = e.target.value
      startTransition(() => {
        setSearchParams(params => {
          if (value) {
            params.set('term', e.target.value)
          } else {
            params.delete('term')
          }
          return params
        })
      })
    }, 200)
  ).current

  const {
    data: { items: events, currentPage, totalPages, permissions }
  } = useEventsQuery({ page, searchTerm })

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t('application.header.competitions')}</h1>

      <input
        className={styles.input}
        type="search"
        placeholder="Search competition by name..."
        defaultValue={searchTerm}
        onInput={handleSearchTermInput}
      />

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
