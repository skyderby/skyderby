import React from 'react'
import { components } from 'react-select'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import SuitLabel from 'components/SuitLabel'
import PlaceLabel from 'components/PlaceLabel'
import Badge from 'components/ui/Badge'

const OptionLabel = styled.div`
  display: flex;

  > :first-child {
    margin-right: 0.5rem;
  }
`

const renderLabel = ({ data, children }) => {
  switch (data.type) {
    case 'suit':
      return (
        <OptionLabel>
          <Badge color="teal">Suit</Badge>
          <SuitLabel name={data.name} code={data.makeCode} />
        </OptionLabel>
      )
    case 'place':
      return (
        <OptionLabel>
          <Badge color="green">Place</Badge>
          <PlaceLabel name={data.name} code={data.countryCode} />
        </OptionLabel>
      )
    case 'profile':
      return (
        <OptionLabel>
          <Badge color="blue">Pilot</Badge>
          {children}
        </OptionLabel>
      )
    default:
      return (
        <OptionLabel>
          {children}
        </OptionLabel>
      )
  }
}

const Option = ({ data, children, ...props }) => (
  <components.Option {...props}>{renderLabel({ data, children })}</components.Option>
)

export default Option
