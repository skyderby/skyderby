import React from 'react'
import { Container, Header, Body } from './elements'
import PropTypes from 'prop-types'

import { usePageContext } from 'components/PageContext'
import TokenizedSearchField from 'components/TokenizedSearchField'

import { places, profiles, suits, years } from 'components/TokenizedSearchField/settings'

const Filters = () => {
  const {
    params: { filters },
    updateFilters
  } = usePageContext()

  const tokens = filters.map(([type, value]) => ({ type, value }))
  const onChange = val => updateFilters(val.map(({ type, value }) => [type, value]))

  return (
    <Container>
      <TokenizedSearchField
        initialValues={tokens}
        onChange={onChange}
        dataTypes={[places, profiles, suits, years]}
      />
    </Container>
  )
}

Filters.propTypes = {
  urlBuilder: PropTypes.func.isRequired
}

export default Filters
