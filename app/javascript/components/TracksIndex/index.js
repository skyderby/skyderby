import React from 'react'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import Pagination from 'components/Pagination'
import TrackList from 'components/TrackList'
import ActivitySelect from './ActivitySelect'
import Filters from './Filters'

import styles from './styles.module.scss'

const TracksIndex = ({ tracks, pagination, params, buildUrl }) => {
  const { t } = useI18n()

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('application.header.tracks')}</h1>
        <ActivitySelect buildUrl={buildUrl} currentActivity={params.activity} />
      </div>

      <Filters />

      <TrackList tracks={tracks} />

      <Pagination buildUrl={buildUrl} {...pagination} />
    </div>
  )
}

TracksIndex.propTypes = {
  tracks: PropTypes.arrayOf(PropTypes.object).isRequired,
  pagination: PropTypes.shape({
    page: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired
  }).isRequired,
  params: PropTypes.shape({
    activity: PropTypes.oneOf(['base', 'skydive'])
  }).isRequired,
  buildUrl: PropTypes.func.isRequired
}

export default TracksIndex
