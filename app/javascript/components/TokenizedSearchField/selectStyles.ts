import { GroupBase, StylesConfig } from 'react-select'

type OptionType = {
  value: number
  label: string
}

const getSelectStyles = <
  Option extends { value: unknown; label: string } = OptionType,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(): StylesConfig<Option, IsMulti, Group> => ({
  container: base => ({
    ...base,
    minWidth: '220px'
  }),
  control: base => ({
    ...base,
    border: 0,
    minHeight: 'auto'
  }),
  indicatorsContainer: base => ({
    ...base,
    display: 'none'
  }),
  input: base => ({
    ...base,
    padding: 0,
    margin: 0
  }),
  option: base => ({
    ...base,
    svg: {
      height: '0.8em',
      width: '1rem',
      path: {
        fill: '#777'
      }
    },
    '> *:not(:last-child)': {
      marginRight: '0.5rem'
    }
  }),
  valueContainer: base => ({
    ...base,
    padding: '2px 8px 2px 4px'
  }),
  placeholder: base => ({ ...base, color: 'var(--grey-70)' })
})

export default getSelectStyles
