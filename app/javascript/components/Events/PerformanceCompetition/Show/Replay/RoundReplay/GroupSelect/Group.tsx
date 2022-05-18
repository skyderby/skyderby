import React from 'react'
import { GroupProps, GroupTypeBase } from 'react-select'
import styles from './styles.module.scss'

import { OptionType } from './types'

const Group = <Option extends OptionType, Group extends GroupTypeBase<Option>>(
  props: GroupProps<Option, true, Group>
) => {
  const {
    children,
    className,
    cx,
    getStyles,
    Heading,
    headingProps,
    label,
    theme,
    selectProps,
    setValue
  } = props

  return (
    <div css={getStyles('group', props)} className={cx({ group: true }, className)}>
      <Heading
        {...headingProps}
        selectProps={selectProps}
        theme={theme}
        getStyles={getStyles}
        cx={cx}
      >
        {label}
        <button
          className={styles.selectButton}
          onClick={() => setValue(props.options, 'select-option')}
        >
          Select group
        </button>
      </Heading>
      <div>{children}</div>
    </div>
  )
}

export default Group
