import React from 'react'
import cx from 'clsx'

import styles from './styles.module.scss'

export type RadioButtonGroupProps = {
  name: string
  value?: string | number
  options: Record<string, string>[]
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => unknown
}

const RadioButtonGroup = ({
  value: currentValue,
  options,
  name,
  onChange
}: RadioButtonGroupProps): JSX.Element => {
  return (
    <div>
      {options.map(({ label, value }, idx) => {
        const checked = String(value) === (currentValue || '').toString()

        return (
          <label className={cx(styles.button, checked && styles.active)} key={idx}>
            <input
              name={name}
              id={`${name}_${value}`}
              type="radio"
              value={value}
              checked={checked}
              onChange={onChange}
            />
            {label}
          </label>
        )
      })}
    </div>
  )
}

export default RadioButtonGroup
