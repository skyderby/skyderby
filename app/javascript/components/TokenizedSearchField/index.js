import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import IconTimes from 'icons/times.svg'
import Token from './Token'
import TokenInput from './TokenInput'
import OptionsDropdown from './OptionsDropdown'
import useOutsideClickHandler from './useOutsideClickHandler'
import ValueSelect from './ValueSelect'
import { Container, SearchContainer, TokensList, ClearButton } from './elements'

const loadTokens = async (initialValues, dataTypes) => {
  const tokens = await Promise.all(
    initialValues.map(async ({ type, value }) => {
      const typeSettings = dataTypes.find(el => el.type === type)

      if (!typeSettings) return

      return { type, ...await typeSettings.loadOption(value) }
    })
  )

  return tokens.filter(el => el)
}

const TokenizedSearchField = ({ initialValues = [], dataTypes = [] }) => {
  const containerRef = useRef()
  const inputRef = useRef()
  const [inputValue, setInputValue] = useState('')
  const [tokens, setTokens] = useState([])
  const [mode, setMode] = useState('idle')
  const [currentType, setCurrentType] = useState()

  useOutsideClickHandler(containerRef, () => {
    inputRef.current.blur()
    setMode('idle')
  })

  useEffect(() => {
    if (initialValues.length === 0 || dataTypes.length === 0) return
    let effectCancelled = false

    loadTokens(initialValues, dataTypes).then(tokens => {
      if (!effectCancelled) setTokens(tokens)
    })

    return () => (effectCancelled = true)
  }, [initialValues, dataTypes])

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

  const handleTypeSelect = type => {
    setCurrentType(type)
    setMode('selectValue')
    inputRef.current.focus()
  }

  const handleValueSelect = value => {
    setTokens([...tokens, { type: currentType.type, ...value }])
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
            aria-label="Search or filter tracks"
            ref={inputRef}
            onClick={handleInputClick}
            onFocus={handleInputFocus}
            value={inputValue}
            placeholder="Search or filter tracks"
            onChange={e => setInputValue(e.target.value)}
          />
        </TokensList>

        {mode === 'selectType' && (
          <OptionsDropdown
            data-testid="type-dropdown"
            options={dataTypes}
            onSelect={handleTypeSelect}
          />
        )}
        {mode === 'selectValue' && (
          <ValueSelect
            settings={currentType}
            inputValue={inputValue}
            onSelect={handleValueSelect}
          />
        )}
      </SearchContainer>

      {tokens.length > 0 && (
        <ClearButton title="Clear" onClick={deleteAll}>
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
  onChange: PropTypes.func.isRequired,
  dataTypes: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      icon: PropTypes.node,
      label: PropTypes.string.isRequired,
      getOptions: PropTypes.func.isRequired,
      getOptionLabel: PropTypes.func
    })
  ).isRequired
}

export default TokenizedSearchField
