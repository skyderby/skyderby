import React from 'react'
import { components, OptionProps } from 'react-select'

type OptionType = {
  label: string
  value: string
  icon: React.ReactNode
}

const Option = (props: OptionProps<OptionType, false>): JSX.Element => (
  <components.Option {...props}>
    <span>{props.data.icon}</span>
    <span>{props.data.label}</span>
  </components.Option>
)

export default Option
