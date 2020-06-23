import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { loadSuit, createSuitSelector } from 'redux/suits'
import IconTimes from 'icons/times.svg'
import SuitLabel from 'components/SuitLabel'
import { SuitContainer, Type, Value, DeleteButton } from './elements'

const Suit = ({ value, onClick, onDelete }) => {
  const dispatch = useDispatch()
  const deleteButtonRef = useRef()

  useEffect(() => {
    dispatch(loadSuit(value))
  }, [dispatch, value])

  const data = useSelector(createSuitSelector(value))

  if (!data) return null

  const handleTokenClick = e => {
    const deleteButtonClicked =
      e.target === deleteButtonRef.current || deleteButtonRef.current.contains(e.target)

    if (deleteButtonClicked) {
      onDelete()
    }

    onClick?.()
  }

  const title = `Place: ${data.name}`

  return (
    <SuitContainer onClick={handleTokenClick} title={title}>
      <Type>Suit</Type>
      <Value>
        <SuitLabel name={data.name} code={data.makeCode} />
        <DeleteButton title="Delete" type="button" ref={deleteButtonRef}>
          <IconTimes />
        </DeleteButton>
      </Value>
    </SuitContainer>
  )
}

Suit.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onDelete: PropTypes.func.isRequired,
  onClick: PropTypes.func
}

export default Suit
