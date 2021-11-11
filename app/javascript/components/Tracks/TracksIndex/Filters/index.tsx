import React from 'react'
import { useLocation, useHistory } from 'react-router-dom'

import { extractParamsFromUrl, IndexParams, mapParamsToUrl } from 'api/tracks'
import TokenizedSearchField from 'components/TokenizedSearchField'
import SortBySelect from './SortBySelect'
import styles from './styles.module.scss'

const Filters = (): JSX.Element => {
  const location = useLocation()
  const history = useHistory()
  const params = extractParamsFromUrl(location.search)

  const buildUrl = (newParams: IndexParams): string =>
    mapParamsToUrl({ ...params, ...newParams })

  const updateFilters = (filters: IndexParams['filters']): void =>
    history.replace(`${location.pathname}${buildUrl({ filters, page: 1 })}`)

  const updateSort = (sortBy: IndexParams['sortBy']): void =>
    history.replace(`${location.pathname}${buildUrl({ sortBy, page: 1 })}`)

  return (
    <div className={styles.container}>
      <TokenizedSearchField initialValues={params.filters} onChange={updateFilters} />
      <SortBySelect value={params.sortBy} onChange={updateSort} />
    </div>
  )
}

export default Filters
