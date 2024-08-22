import React from 'react'
import { components, SingleValueProps } from 'react-select'

import { SuitName } from 'components/SuitLabel'
import { OptionType } from './types'

const SingleValue = (props: SingleValueProps<OptionType>) => {
  const {
    data: { label, make: { code } = {} }
  } = props

  return (
    <components.SingleValue {...props}>
      <SuitName name={label} code={code} />
    </components.SingleValue>
  )
}

export default SingleValue
