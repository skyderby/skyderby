import React from 'react'
import { components, OptionProps } from 'react-select'

import { SuitName } from 'components/SuitLabel'
import { OptionType } from './types'

const Option = (props: OptionProps<OptionType, false>) => {
  const { label, make: { code } = {} } = props.data

  return (
    <components.Option {...props}>
      <SuitName name={label} code={code} />
    </components.Option>
  )
}

export default Option
