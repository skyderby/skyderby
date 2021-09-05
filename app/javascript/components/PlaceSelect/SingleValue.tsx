import React from 'react'
import { components, SingleValueProps } from 'react-select'

import PlaceLabel from 'components/PlaceLabel'

type OptionType = {
  value: number
}

const SingleValue = (props: SingleValueProps<OptionType>): JSX.Element => {
  const {
    data: { value }
  } = props

  return (
    <components.SingleValue {...props}>
      <PlaceLabel placeId={value} />
    </components.SingleValue>
  )
}

export default SingleValue
