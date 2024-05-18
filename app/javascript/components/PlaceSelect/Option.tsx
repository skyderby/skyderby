import React from 'react'
import { components, OptionProps } from 'react-select'

import PlaceLabel from 'components/PlaceLabel'
import { OptionType } from './types'

const Option = (props: OptionProps<OptionType, boolean>) => {
  const {
    data: { value }
  } = props

  return (
    <components.Option {...props}>
      <PlaceLabel placeId={value} />
    </components.Option>
  )
}

export default Option
