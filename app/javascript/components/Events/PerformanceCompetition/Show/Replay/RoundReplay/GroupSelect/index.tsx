import React from 'react'
import Select, { Props } from 'react-select'

import getSelectStyles from 'styles/selectStyles'
import Group from './Group'
import { OptionType, CompetitorRoundMapData } from './types'

type GroupSelectProps = Omit<Props<OptionType, true>, 'value'> & {
  value: CompetitorRoundMapData[]
}
const GroupSelect = ({ value, options, ...props }: GroupSelectProps) => {
  const allOptions = options?.flatMap(
    (group: { label: string; options: OptionType[] }) => group.options
  )

  const selectedOptions = value.map(val =>
    allOptions.find((option: OptionType) => option.value === val)
  )

  return (
    <Select<OptionType, true>
      isMulti
      components={{ Group }}
      options={options}
      value={selectedOptions}
      styles={getSelectStyles()}
      {...props}
    />
  )
}

export type { CompetitorRoundMapData }
export default GroupSelect
