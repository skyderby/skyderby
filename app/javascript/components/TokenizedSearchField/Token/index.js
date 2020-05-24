import React, { useRef } from 'react'
import PropTypes from 'prop-types'

import IconTimes from 'icons/times.svg'
import { Container, Type, Value, DeleteButton } from './elements'

const Token = ({ type, label, onClick, onDelete: handleDelete }) => {
  const deleteButtonRef = useRef()

  const handleTokenClick = e => {
    const deleteButtonClicked =
      e.target === deleteButtonRef.current || deleteButtonRef.current.contains(e.target)

    if (deleteButtonClicked) return

    onClick()
  }

  return (
    <Container type={type} onClick={handleTokenClick}>
      <Type>{type}</Type>
      <Value>
        {label}
        <DeleteButton type="button" ref={deleteButtonRef} onClick={handleDelete}>
          <IconTimes />
        </DeleteButton>
      </Value>
    </Container>
  )
}

Token.propTypes = {
  type: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  onClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
}

export default Token
