import React, { useCallback } from 'react'
import PropTypes from 'prop-types'

import { usePageContext } from 'components/PageContext'
import TokenizedSearchField from 'components/TokenizedSearchField'

import { Container } from './elements'

const Filters = () => {
  const {
    params: { filters },
    updateFilters
  } = usePageContext()

  const tokens = filters.map(([type, value]) => ({ type, value }))
  const onChange = useCallback(
    val => updateFilters(val.map(({ type, value }) => [type, value])),
    [updateFilters]
  )

  return (
    <Container>
      <TokenizedSearchField initialValues={tokens} onChange={onChange} />
    </Container>
  )
}

Filters.propTypes = {
  urlBuilder: PropTypes.func.isRequired
}

export default Filters
