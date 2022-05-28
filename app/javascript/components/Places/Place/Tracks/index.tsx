import React from 'react'
import { useLocation } from 'react-router-dom'
import Filters from 'components/Tracks/TracksIndex/Filters'
import {
  extractParamsFromUrl,
  IndexParams,
  mapParamsToUrl,
  useTracksQuery
} from 'api/tracks'
import TrackList from 'components/TrackList'
import Pagination from 'components/Pagination'
import styles from './styles.module.scss'

type TracksProps = {
  placeId: number
}

const Tracks = ({ placeId }: TracksProps) => {
  const location = useLocation()
  const urlParams = extractParamsFromUrl(location.search, 'tracks')
  const queryParams = {
    ...urlParams,
    filters: [...urlParams.filters, ['placeId', placeId] as const]
  }
  const { data, isLoading } = useTracksQuery(queryParams)
  const tracks = data?.items ?? []

  const buildUrl = (newParams: IndexParams) =>
    mapParamsToUrl({ ...urlParams, ...newParams }, 'tracks')

  const pagination = isLoading
    ? null
    : { page: data?.currentPage, totalPages: data?.totalPages }

  return (
    <div className={styles.container}>
      <Filters params={urlParams} buildUrl={buildUrl} exclude="placeId" />
      <TrackList tracks={tracks} />

      {pagination && <Pagination buildUrl={buildUrl} {...pagination} />}
    </div>
  )
}

export default Tracks
