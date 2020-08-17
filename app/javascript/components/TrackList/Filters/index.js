import React from 'react'

import { usePageContext } from 'components/PageContext'
import TokenizedSearchField from 'components/TokenizedSearchField'

import SortBySelect from './SortBySelect'
import { Container } from './elements'

const Filters = () => {
  const {
    params: { filters, sortBy },
    updateFilters,
    updateSort
  } = usePageContext()

  return (
    <Container>
      <TokenizedSearchField initialValues={filters} onChange={updateFilters} />
      <SortBySelect sortBy={sortBy} onChange={updateSort} />
    </Container>
  )
}

export default Filters
