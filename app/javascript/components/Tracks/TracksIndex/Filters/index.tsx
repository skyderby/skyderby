import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { extractParamsFromUrl, IndexParams, mapParamsToUrl } from 'api/tracks'
import TokenizedSearchField from 'components/TokenizedSearchField'
import SortBySelect from './SortBySelect'
import styles from './styles.module.scss'

const Filters = (): JSX.Element => {
  const location = useLocation()
  const navigate = useNavigate()
  const params = extractParamsFromUrl(location.search)

  const buildUrl = (newParams: IndexParams): string =>
    mapParamsToUrl({ ...params, ...newParams })

  const updateFilters = (filters: IndexParams['filters']): void =>
    navigate(`${location.pathname}${buildUrl({ filters, page: 1 })}`, { replace: true })

  const updateSort = (sortBy: IndexParams['sortBy']): void =>
    navigate(`${location.pathname}${buildUrl({ sortBy, page: 1 })}`, { replace: true })

  return (
    <div className={styles.container}>
      <TokenizedSearchField initialValues={params.filters} onChange={updateFilters} />
      <SortBySelect value={params.sortBy} onChange={updateSort} />
    </div>
  )
}

export default Filters
