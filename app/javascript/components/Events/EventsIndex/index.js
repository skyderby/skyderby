import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import { useEventsQuery } from 'api/hooks/events'
import { useI18n } from 'components/TranslationsProvider'
import AppShell from 'components/AppShell'
import Pagination from 'components/Pagination'
import PlusIcon from 'icons/plus'
import Item from './Item'
import styles from './styles.module.scss'

const mapParamsToUrl = ({ page }) => {
  const params = new URLSearchParams()
  params.set('page', page)

  return params.toString() === '' ? '' : '?' + params.toString()
}

const EventsIndex = ({ location }) => {
  const { t } = useI18n()
  const urlParams = new URLSearchParams(location.search)
  const page = urlParams.get('page') || '1'
  const { data, status, error } = useEventsQuery({ page })
  const events = data?.items || []
  const pagination = { page: data?.currentPage, totalPages: data?.totalPages }

  return (
    <AppShell>
      <div className={styles.container}>
        <h1 className={styles.title}>{t('application.header.competitions')}</h1>

        {events.map(event => (
          <Item key={`${event.type}/${event.id}`} event={event} />
        ))}

        <Pagination buildUrl={mapParamsToUrl} {...pagination} />

        <Link to="/events/new" className={styles.fab}>
          <PlusIcon />
        </Link>
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
