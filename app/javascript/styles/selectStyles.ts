import { GroupBase, StylesConfig } from 'react-select'
import type {} from 'react-select/base'

declare module 'react-select/base' {
  export interface Props<
    Option,
    IsMulti extends boolean, // eslint-disable-line @typescript-eslint/no-unused-vars
    Group extends GroupBase<Option> // eslint-disable-line @typescript-eslint/no-unused-vars
  > {
    hide?: boolean
    isInvalid?: string | boolean
  }
}

const getSelectStyles = <
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(): StylesConfig<Option, IsMulti, Group> => ({
  container: (base, state) => ({
    ...base,
    ...(state.selectProps?.hide ? { display: 'none' } : {}),
    flexGrow: 1
  }),
  control: (base, state) => ({
    ...base,
    borderColor: state.selectProps?.isInvalid ? 'var(--red-90)' : 'var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    minHeight: '2.1875rem'
  }),
  dropdownIndicator: base => ({
    ...base,
    alignSelf: 'baseline',
    padding: '6px'
  }),
  menuPortal: base => ({ ...base, zIndex: 1100 }),
  placeholder: base => ({ ...base, color: 'var(--grey-70)' })
})

export default getSelectStyles
