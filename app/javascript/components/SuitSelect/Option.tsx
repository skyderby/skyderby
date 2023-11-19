import React from 'react'
import { components, OptionProps } from 'react-select'

import { SuitName } from 'components/SuitLabel'
import { OptionType } from './types'

const Option = (props: OptionProps<OptionType, boolean>): JSX.Element => {
  const {
    data: {
      name,
      make: { code }
    }
  } = props

  return (
    <components.Option {...props}>
      <SuitName name={name} code={code} />
    </components.Option>
  )
}

export default Option
