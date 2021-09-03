import React from 'react'
import { components, OptionProps } from 'react-select'

type OptionType = {
  data: {
    icon: JSX.Element
    label: string
  }
}

const Option = (props: OptionProps<OptionType, false>): JSX.Element => (
  <components.Option {...props}>
    <span>{props.data.icon}</span>
    <span>{props.data.label}</span>
  </components.Option>
)

export default Option
