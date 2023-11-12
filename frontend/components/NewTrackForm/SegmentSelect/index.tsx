'use client'

import React from 'react'
import Select, { Props } from 'react-select'

import getSelectStyles from 'styles/selectStyles'

import Option from './Option'
import { OptionType } from './types'

type SegmentSelectProps = Omit<Props<OptionType>, 'value'> & {
  value?: number
  onChange: (value: number | null) => unknown
}

const SegmentSelect = ({
  value,
  options,
  onChange,
  ...props
}: SegmentSelectProps): JSX.Element => {
  const selectedOption = (value && options?.[value]) || null

  return (
    <Select<OptionType, boolean>
      value={selectedOption}
      options={options}
      onChange={option => {
        if (option === null) {
          onChange(option)
        } else if ('value' in option) {
          onChange(option.value)
        }
      }}
      components={{ Option }}
      styles={getSelectStyles<OptionType>()}
      {...props}
    />
  )
}

export default SegmentSelect
