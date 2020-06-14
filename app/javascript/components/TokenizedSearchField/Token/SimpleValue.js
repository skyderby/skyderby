import React, { useRef } from 'react'
import PropTypes from 'prop-types'

import IconTimes from 'icons/times.svg'
import { Container, Type, Value, DeleteButton } from './elements'

const SimpleValue = ({ type, value, onClick, onDelete }) => {
  const deleteButtonRef = useRef()

  const handleTokenClick = e => {
    const deleteButtonClicked =
      e.target === deleteButtonRef.current || deleteButtonRef.current.contains(e.target)

    if (deleteButtonClicked) {
      onDelete?.()
    }

    onClick?.()
  }

  const title = `${type}: ${value}`

  return (
    <Container onClick={handleTokenClick} title={title}>
      <Type>{type}</Type>
      <Value>
        {value}
        <DeleteButton title="Delete" type="button" ref={deleteButtonRef}>
          <IconTimes />
        </DeleteButton>
      </Value>
    </Container>
  )
}

SimpleValue.propTypes = {
  type: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
}

export default SimpleValue
