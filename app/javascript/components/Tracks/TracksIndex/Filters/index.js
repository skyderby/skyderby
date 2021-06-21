import React from 'react'
import { useLocation, useHistory } from 'react-router-dom'

import { extractParamsFromUrl, mapParamsToUrl } from 'api/hooks/tracks'
import TokenizedSearchField from 'components/TokenizedSearchField'
import SortBySelect from './SortBySelect'
import styles from './styles.module.scss'

const Filters = () => {
  const location = useLocation()
  const history = useHistory()
  const params = extractParamsFromUrl(location.search)

  const buildUrl = newParams => mapParamsToUrl({ ...params, ...newParams })

  const updateFilters = filters =>
    history.replace(`${location.pathname}${buildUrl({ filters, page: 1 })}`)

  const updateSort = sortBy =>
    history.replace(`${location.pathname}${buildUrl({ sortBy, page: 1 })}`)

  return (
    <div className={styles.container}>
      <TokenizedSearchField initialValues={params.filters} onChange={updateFilters} />
      <SortBySelect sortBy={params.sortBy} onChange={updateSort} />
    </div>
  )
}

export default Filters
