import React, { useRef, useState, useEffect } from 'react'

import IconTimes from 'icons/times.svg'
import Token from './Token'
import TokenInput from './TokenInput'
import TypeDropdown from './TypeDropdown'
import useOutsideClickHandler from './useOutsideClickHandler'
import { Container, SearchContainer, TokensList, ClearButton } from './elements'

const initialData = [
  { type: 'profile', operator: 'is', label: 'Aleksandr Kunin', value: 3 },
  { type: 'suit', operator: 'is', label: 'TS Nala', value: 5 },
  { type: 'place', operator: 'is', label: 'Brento', value: 7 }
]

const TokenizedSearchField = () => {
  const containerRef = useRef()
  const inputRef = useRef()
  const [tokens, setTokens] = useState(initialData)
  const [mode, setMode] = useState('idle')
  const [chosenType, setChosenType] = useState()

  useOutsideClickHandler(containerRef, () => {
    inputRef.current.blur()
    setMode('idle')
  })

  const handleContainerClick = evt => {
    if (evt.target !== evt.currentTarget) return

    if (mode === 'idle') {
      setMode('selectType')
    } else {
      setMode('idle')
    }
  }

  const handleInputClick = () => {
    if (mode === 'idle') setMode('selectType')
    if (mode === 'selectType') setMode('idle')
  }

  const handleInputFocus = evt => {
    if (mode !== 'selectValue') evt.target.blur()
  }

  const handleTypeSelect = value => {
    setChosenType(value)
    setMode('selectValue')
    inputRef.current.focus()
  }

  const handleTokenClick = idx => {
    console.log(idx)
  }

  const deleteAll = () => setTokens([])
  const deleteByIdx = deletedIdx =>
    setTokens(tokens.filter((_el, idx) => idx !== deletedIdx))

  return (
    <Container ref={containerRef}>
      <SearchContainer onClick={handleContainerClick}>
        <TokensList onClick={handleContainerClick}>
          {tokens.map((el, idx) => (
            <Token
              key={idx}
              {...el}
              onClick={() => handleTokenClick(idx)}
              onDelete={() => deleteByIdx(idx)}
            />
          ))}

          <TokenInput
            ref={inputRef}
            onClick={handleInputClick}
            onFocus={handleInputFocus}
          />
        </TokensList>

        {mode === 'selectType' && <TypeDropdown onSelect={handleTypeSelect} />}
      </SearchContainer>

      <ClearButton onClick={deleteAll}>
        <IconTimes />
      </ClearButton>
    </Container>
  )
}

export default TokenizedSearchField
