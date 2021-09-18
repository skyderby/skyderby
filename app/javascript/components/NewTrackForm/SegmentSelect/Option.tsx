import React from 'react'
import { components, OptionProps } from 'react-select'

import { useI18n } from 'components/TranslationsProvider'
import { OptionType } from './types'

const Option = (props: OptionProps<OptionType, boolean>): JSX.Element => {
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

export default Option
