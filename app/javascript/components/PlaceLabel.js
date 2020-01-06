import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const Separator = styled.span`
  color: #999;
`

const CountryCode = styled.span`
  color: #75a4ba;
  text-transform: uppercase;
`

const PlaceLabel = ({ name, code }) => (
  <span>
    {name && <span>{name}</span>}
    {code && (
      <>
        &nbsp;
        <Separator>{'//'}</Separator>
        &nbsp;
        <CountryCode>{code}</CountryCode>
      </>
    )}
  </span>
)

PlaceLabel.propTypes = {
  name: PropTypes.string,
  code: PropTypes.string
}

export default PlaceLabel
