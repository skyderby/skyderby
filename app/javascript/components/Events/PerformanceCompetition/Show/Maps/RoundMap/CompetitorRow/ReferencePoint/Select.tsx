import React from 'react'
import Select, { StylesConfig, Theme, Props } from 'react-select'
import { ReferencePoint } from 'api/performanceCompetitions'
import { OptionType } from 'components/SuitSelect'

const styles: StylesConfig<{ value: number | null }, boolean> = {
  control: base => ({
    ...base,
    fontSize: '14px',
    width: '5rem'
  }),
  placeholder: base => ({
    ...base,
    fontSize: '14px'
  })
}

const theme = (theme: Theme): Theme => ({
  ...theme,
  spacing: {
    baseUnit: 2,
    menuGutter: 4,
    controlHeight: 28
  }
})

const placeholder = <>&mdash;</>
const blankOption = { value: null, label: placeholder }

interface ReferencePointSelectProps extends Omit<Props<OptionType, boolean>, 'value'> {
  value: ReferencePoint | null
  referencePoints: ReferencePoint[]
}

const ReferencePointSelect = ({
  value: selectedReferencePoint,
  referencePoints,
  ...selectProps
}: ReferencePointSelectProps) => {
  const options = [
    blankOption,
    ...referencePoints.map(({ id, name }) => ({
      value: id,
      label: name
    }))
  ]

  const valueOption =
    selectedReferencePoint && options.find(el => el.value === selectedReferencePoint.id)

  return (
    <Select
      menuPlacement="auto"
      options={options}
      value={valueOption}
      placeholder={placeholder}
      theme={theme}
      styles={styles}
      menuPortalTarget={document.getElementById('dropdowns-root')}
      {...selectProps}
    />
  )
}

export default ReferencePointSelect
