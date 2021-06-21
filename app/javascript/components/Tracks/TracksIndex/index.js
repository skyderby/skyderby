import React from 'react'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import AppShell from 'components/AppShell'
import Pagination from 'components/Pagination'
import TrackList from 'components/TrackList'
import ActivitySelect from './ActivitySelect'
import Filters from './Filters'
import styles from './styles.module.scss'
import { extractParamsFromUrl, mapParamsToUrl, useTracksQuery } from 'api/hooks/tracks'

const TracksIndex = ({ location }) => {
  const { t } = useI18n()

  const params = extractParamsFromUrl(location.search)
  const { data = {}, isLoading } = useTracksQuery(params)
  const tracks = data.items || []
  const pagination = isLoading
    ? null
    : { page: data.currentPage, totalPages: data.totalPages }

  const buildUrl = newParams => mapParamsToUrl({ ...params, ...newParams })

  return (
    <AppShell>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('application.header.tracks')}</h1>
          <ActivitySelect buildUrl={buildUrl} currentActivity={params.activity} />
        </div>

        <Filters />

        <TrackList tracks={tracks} />

        {pagination && <Pagination buildUrl={buildUrl} {...pagination} />}
      </div>
    </AppShell>
  )
}

TracksIndex.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
    pathname: PropTypes.string
  }).isRequired
}

export default TracksIndex
