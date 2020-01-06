import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const ManufacturerCode = styled.span`
  color: #999;
`

const SuitLabel = ({ name, code }) => (
  <span>
    {code && <ManufacturerCode>{code}</ManufacturerCode>}
    &nbsp;
    {name && <span>{name}</span>}
  </span>
)

SuitLabel.propTypes = {
  name: PropTypes.string,
  code: PropTypes.string
}

export default SuitLabel
