import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import IconTimes from 'icons/times.svg'
import Token from './Token'
import useOutsideClickHandler from './useOutsideClickHandler'
import ValueSelect from './ValueSelect'
import TypeSelect from './TypeSelect'
import { Container, TokensList, ClearButton } from './elements'

const TokenizedSearchField = ({ initialValues = [], onChange }) => {
  const containerRef = useRef()
  const [tokens, setTokens] = useState(initialValues)
  const [mode, setMode] = useState('idle')
  const [currentType, setCurrentType] = useState()

  useOutsideClickHandler(containerRef, () => {
    setMode('idle')
  })

  const fireOnChange = tokens => onChange?.(tokens)

  const handleBlur = evt => {
    if (evt.target !== evt.currentTarget) return

    if (mode === 'idle') {
      setMode('selectType')
    } else {
      setMode('idle')
    }
  }

  const handleTypeSelect = ({ value }) => {
    setCurrentType(value)
    setMode('selectValue')
  }

  const handleValueSelect = newToken => {
    const newSetOfTokens = [...tokens, newToken]

    setTokens(newSetOfTokens)
    fireOnChange(newSetOfTokens)

    setMode('idle')
  }

  const deleteAll = () => {
    setTokens([])
    fireOnChange([])
  }

  const deleteByIdx = deletedIdx => {
    const newSetOfTokens = tokens.filter((_el, idx) => idx !== deletedIdx)

    setTokens(newSetOfTokens)
    fireOnChange(newSetOfTokens)
  }

  return (
    <Container ref={containerRef}>
      <TokensList onClick={handleBlur}>
        {tokens.map(([type, value], idx) => (
          <Token key={idx} type={type} value={value} onDelete={() => deleteByIdx(idx)} />
        ))}

        <li>
          {['idle', 'selectType'].includes(mode) && (
            <TypeSelect onChange={handleTypeSelect} />
          )}

          {mode === 'selectValue' && (
            <ValueSelect
              type={currentType}
              onChange={handleValueSelect}
              onBlur={handleBlur}
            />
          )}
        </li>
      </TokensList>

      {tokens.length > 0 && (
        <ClearButton title="Clear all" onClick={deleteAll}>
          <IconTimes />
        </ClearButton>
      )}
    </Container>
  )
}

TokenizedSearchField.propTypes = {
  initialValues: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired
}

export default TokenizedSearchField
