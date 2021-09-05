import React from 'react'
import { components, OptionProps } from 'react-select'

import SuitLabel from 'components/SuitLabel'
import { OptionType } from './types'

const Option = (props: OptionProps<OptionType, false>): JSX.Element => {
  const {
    data: {
      name,
      make: { code }
    }
  } = props

  return (
    <components.Option {...props}>
      <SuitLabel name={name} code={code} />
    </components.Option>
  )
}

export default Option
