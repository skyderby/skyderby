import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import type { IndexParams, FilterKey, extractParamsFromUrl } from 'api/tracks'
import TokenizedSearchField from 'components/TokenizedSearchField'
import SortBySelect from './SortBySelect'
import styles from './styles.module.scss'

type FiltersProps = {
  params: ReturnType<typeof extractParamsFromUrl>
  buildUrl: (params: IndexParams) => string
  exclude?: FilterKey
}

const Filters = ({ params, buildUrl, exclude }: FiltersProps) => {
  const location = useLocation()
  const navigate = useNavigate()

  const updateFilters = (filters: IndexParams['filters']): void =>
    navigate(`${location.pathname}${buildUrl({ filters, page: 1 })}`, { replace: true })

  const updateSort = (sortBy: IndexParams['sortBy']): void =>
    navigate(`${location.pathname}${buildUrl({ sortBy, page: 1 })}`, { replace: true })

  return (
    <div className={styles.container}>
      <TokenizedSearchField
        initialValues={params.filters}
        onChange={updateFilters}
        exclude={exclude}
      />
      <SortBySelect value={params.sortBy} onChange={updateSort} />
    </div>
  )
}

export default Filters
