import React, { useRef, useState } from 'react'

import IconTimes from 'icons/times.svg'
import Token from './Token'
import TokenInput from './TokenInput'
import OptionsDropdown from './OptionsDropdown'
import useOutsideClickHandler from './useOutsideClickHandler'
import ValueSelect from './ValueSelect'
import { Container, SearchContainer, TokensList, ClearButton } from './elements'
import getSettings from './getSettings'

const initialData = [
  { type: 'profile', label: 'Aleksandr Kunin', value: 3 },
  { type: 'suit', label: 'TS Nala', value: 5 },
  { type: 'place', label: 'Brento', value: 7 }
]

const TokenizedSearchField = () => {
  const containerRef = useRef()
  const inputRef = useRef()
  const [inputValue, setInputValue] = useState('')
  const [tokens, setTokens] = useState(initialData)
  const [mode, setMode] = useState('idle')
  const [typeSettings, setCurrentType] = useState()

  const settings = getSettings()

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

  const handleTypeSelect = typeSettings => {
    setCurrentType(typeSettings)
    setMode('selectValue')
    inputRef.current.focus()
  }

  const handleValueSelect = value => {
    setTokens([...tokens, { type: typeSettings.type, ...value }])
    setMode('idle')
    setInputValue('')
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
              onClick={() => handleTokenClick(idx)}
              onDelete={() => deleteByIdx(idx)}
              {...el}
            />
          ))}

          <TokenInput
            ref={inputRef}
            onClick={handleInputClick}
            onFocus={handleInputFocus}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
        </TokensList>

        {mode === 'selectType' && (
          <OptionsDropdown options={settings} onSelect={handleTypeSelect} />
        )}
        {mode === 'selectValue' && (
          <ValueSelect
            settings={typeSettings}
            inputValue={inputValue}
            onSelect={handleValueSelect}
          />
        )}
      </SearchContainer>

      <ClearButton onClick={deleteAll}>
        <IconTimes />
      </ClearButton>
    </Container>
  )
}

export default TokenizedSearchField
