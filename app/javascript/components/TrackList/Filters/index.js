import React from 'react'
import { Container, Header, Body } from './elements'
import { useHistory, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'

import TokenizedSearchField from 'components/TokenizedSearchField'

import { places, profiles, suits, years } from 'components/TokenizedSearchField/settings'

const Filters = ({ urlBuilder }) => {
  const tokens =
    Array.from(new URLSearchParams(useLocation().search))
    .map(([key, value]) => ({ type: key.replace(/(Id)?\[\]/, ''), value}))

  const onChange = val => console.log(val)

  return (
    <Container>
      <TokenizedSearchField initialValues={tokens} onChange={onChange} dataTypes={[places, profiles, suits, years]} />
    </Container>
  )
}

Filters.propTypes = {
  urlBuilder: PropTypes.func.isRequired
}

export default Filters
