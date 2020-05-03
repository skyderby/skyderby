import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'

const RadioButtonGroup = ({ value: currentValue, options, name, onChange }) => {
  return (
    <Container>
      {options.map(({ label, value }, idx) => {
        const checked = value.toString() === (currentValue || '').toString()

        return (
          <Label key={idx} active={checked}>
            <input
              name={name}
              id={`${name}_${value}`}
              type="radio"
              value={value}
              checked={checked}
              onChange={onChange}
            />
            {label}
          </Label>
        )
      })}
    </Container>
  )
}

const Container = styled.div``
const Label = styled.label`
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  margin: 0;
  padding: 0.3rem 1rem;

  &:hover {
    background-color: #e6e6e6;
  }

  ${props =>
    props.active &&
    css`
      background-color: #e6e6e6;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    `}

  &:first-child:not(:last-child) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  &:not(:first-child):not(:last-child) {
    border-radius: 0;
  }

  &:last-child:not(:first-child) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  &:not(:first-child) {
    margin-left: -1px;
  }

  input {
    position: absolute;
    clip: rect(0, 0, 0, 0);
    pointer-events: none;
  }
`

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
