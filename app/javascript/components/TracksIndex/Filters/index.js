import React from 'react'

import { usePageContext } from 'components/PageContext'
import TokenizedSearchField from 'components/TokenizedSearchField'

import SortBySelect from './SortBySelect'

import styles from './styles.module.scss'

const Filters = () => {
  const {
    params: { filters, sortBy },
    updateFilters,
    updateSort
  } = usePageContext()

  return (
    <div className={styles.container}>
      <TokenizedSearchField initialValues={filters} onChange={updateFilters} />
      <SortBySelect sortBy={sortBy} onChange={updateSort} />
    </div>
  )
}

export default Filters
