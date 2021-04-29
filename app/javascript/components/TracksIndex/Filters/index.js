import React from 'react'
import PropTypes from 'prop-types'

import TokenizedSearchField from 'components/TokenizedSearchField'

import SortBySelect from './SortBySelect'

import styles from './styles.module.scss'

const Filters = props => {
  const {
    params: { filters, sortBy },
    updateFilters,
    updateSort
  } = props

  return (
    <div className={styles.container}>
      <TokenizedSearchField initialValues={filters} onChange={updateFilters} />
      <SortBySelect sortBy={sortBy} onChange={updateSort} />
    </div>
  )
}

Filters.propTypes = {
  params: PropTypes.shape({
    filters: PropTypes.array,
    sortBy: PropTypes.oneOf([])
  }).isRequired,
  updateFilters: PropTypes.func.isRequired,
  updateSort: PropTypes.func.isRequired
}
export default Filters
