import React from 'react'
import { GroupProps, GroupBase } from 'react-select'
import styles from './styles.module.scss'

import { OptionType } from './types'

const Group = <Option extends OptionType, Group extends GroupBase<Option>>(
  props: GroupProps<Option, true, Group>
) => {
  const {
    Heading,
    getStyles,
    getClassNames,
    children,
    label,
    headingProps,
    cx,
    theme,
    selectProps,
    setValue
  } = props

  return (
    // TS error comes from storybook dependency on emotion v10, while react-select uses v11
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <div css={getStyles('group', props)}>
      <Heading
        {...headingProps}
        selectProps={selectProps}
        theme={theme}
        getStyles={getStyles}
        getClassNames={getClassNames}
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
