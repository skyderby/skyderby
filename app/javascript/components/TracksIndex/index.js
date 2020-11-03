import React from 'react'
import { useSelector } from 'react-redux'

import { useI18n } from 'components/TranslationsProvider'
import { usePageContext } from 'components/PageContext'
import { selectPagination } from 'redux/tracks/tracksIndex'
import { selectAllTracks } from 'redux/tracks/tracksIndex/selectors'
import Pagination from 'components/Pagination'
import TrackList from 'components/TrackList'
import ActivitySelect from './ActivitySelect'
import Filters from './Filters'

import styles from './styles.module.scss'

const TracksIndex = () => {
  const { t } = useI18n()
  const { params, buildUrl } = usePageContext()
  const paginationOptions = useSelector(selectPagination)
  const tracks = useSelector(selectAllTracks)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('application.header.tracks')}</h1>
        <ActivitySelect buildUrl={buildUrl} currentActivity={params.activity} />
      </div>

      <Filters />

      <TrackList tracks={tracks} />

      <Pagination buildUrl={buildUrl} showAround={3} {...paginationOptions} />
    </div>
  )
}

export default TracksIndex
