import React from 'react'
import { components, OptionProps } from 'react-select'
import PropTypes from 'prop-types'

import PlaceLabel from 'components/PlaceLabel'

type OptionType = {
  value: number
}

const Option = (props: OptionProps<OptionType, false>): JSX.Element => {
  const {
    data: { value }
  } = props

  return (
    <components.Option {...props}>
      <PlaceLabel placeId={value} />
    </components.Option>
  )
}

Option.propTypes = {
  value: PropTypes.number.isRequired
}

export default Option
