import React from 'react'
import cx from 'clsx'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const RadioButtonGroup = ({ value: currentValue, options, name, onChange }) => {
  return (
    <div>
      {options.map(({ label, value }, idx) => {
        const checked = value.toString() === (currentValue || '').toString()

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

RadioButtonGroup.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

RadioButtonGroup.defaultProps = {
  value: ''
}

export default RadioButtonGroup
