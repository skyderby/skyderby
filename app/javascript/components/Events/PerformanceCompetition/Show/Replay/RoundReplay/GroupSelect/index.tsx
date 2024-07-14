import React from 'react'
import Select, { Props } from 'react-select'

import getSelectStyles from 'styles/selectStyles'
import Group from './Group'
import { OptionType, CompetitorRoundMapData } from './types'

type GroupSelectProps = Omit<Props<OptionType, true>, 'value'> & {
  value: CompetitorRoundMapData[]
}

const GroupSelect = ({ value, options, ...props }: GroupSelectProps) => {
  const allOptions =
    options?.flatMap(groupOrOption => {
      if ('options' in groupOrOption) return groupOrOption.options

      return groupOrOption
    }) ?? []

  const selectedOptions = value.map(val => {
    const option = allOptions.find((option: OptionType) => option.value === val)
    if (!option) throw new Error('Option not found')

    return option
  })

  return (
    <Select<OptionType, true>
      isMulti
      components={{ Group }}
      options={options}
      value={selectedOptions}
      styles={getSelectStyles<OptionType, true>()}
      {...props}
    />
  )
}

export type { CompetitorRoundMapData }
export default GroupSelect
