import React from 'react'
import Select, { components, OptionProps, Props } from 'react-select'
import { Segment } from 'api/tracks'
import getSelectStyles from 'styles/selectStyles'

import { useI18n } from 'components/TranslationsProvider'

type OptionType = {
  value: number
  label: string
  segment: Segment
}

type SegmentSelectProps = Omit<Props<OptionType, false>, 'value' | 'options'> & {
  value?: number
  options: OptionType[]
}

const Option = (props: OptionProps<OptionType, false>) => {
  const { t } = useI18n()

  const {
    data: {
      segment: { name, pointsCount, hUp, hDown }
    }
  } = props

  return (
    <components.Option {...props}>
      <div>{name}</div>
      <div>
        {t('tracks.choose.pt_cnt')}: {pointsCount}; {t('tracks.choose.elev')}: {hUp}↑{' '}
        {hDown}↓ {t('units.m')}
      </div>
    </components.Option>
  )
}

const SegmentSelect = ({ value, options, ...props }: SegmentSelectProps) => {
  const selectedOption = (value && options?.[value]) || undefined

  return (
    <Select
      value={selectedOption}
      options={options}
      components={{ Option }}
      styles={getSelectStyles<OptionType, false>()}
      {...props}
    />
  )
}

export default SegmentSelect
