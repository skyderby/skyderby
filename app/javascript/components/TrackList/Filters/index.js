import React from 'react'

import { usePageContext } from 'components/PageContext'
import TokenizedSearchField from 'components/TokenizedSearchField'

import { Container } from './elements'

const Filters = () => {
  const {
    params: { filters },
    updateFilters
  } = usePageContext()

  return (
    <Container>
      <TokenizedSearchField initialValues={filters} onChange={updateFilters} />
    </Container>
  )
}

export default Filters
