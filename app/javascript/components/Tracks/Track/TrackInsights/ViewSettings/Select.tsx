import React from 'react'
import ReactSelect, { Props, StylesConfig, Theme } from 'react-select'

type OptionType = {
  value: string
  label: string
}

const styles: StylesConfig<OptionType, false> = {
  container: base => ({
    ...base,
    flexGrow: 1
  })
}

const theme = (theme: Theme): Theme => ({
  ...theme,
  borderRadius: 4,
  spacing: {
    ...theme.spacing,
    controlHeight: 30,
    baseUnit: 2
  }
})

type SelectProps = Omit<Props<OptionType>, 'value'> & {
  value: string
  options: readonly OptionType[]
}

const Select = ({ value, options, ...props }: SelectProps): JSX.Element => {
  const selectedOption = options.find(el => el.value === value) || null

  return (
    <ReactSelect
      value={selectedOption}
      options={options}
      styles={styles}
      theme={theme}
      {...props}
    />
  )
}

export default Select
