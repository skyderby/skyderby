import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'

import IconTimes from 'icons/times.svg'
import Token from './Token'
import useOutsideClickHandler from './useOutsideClickHandler'
import ValueSelect from './ValueSelect'
import TypeSelect from './TypeSelect'

import styles from './styles.module.scss'

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
    <div className={styles.container} ref={containerRef} aria-label="Search field">
      <ul className={styles.tokensList} onClick={handleBlur}>
        {tokens.map(([type, value], idx) => (
          <Token key={idx} type={type} value={value} onDelete={() => deleteByIdx(idx)} />
        ))}

        <li>
          {['idle', 'selectType'].includes(mode) && (
            <TypeSelect aria-label="Select filter criteria" onChange={handleTypeSelect} />
          )}

          {mode === 'selectValue' && (
            <ValueSelect
              type={currentType}
              onChange={handleValueSelect}
              onBlur={handleBlur}
            />
          )}
        </li>
      </ul>

      {tokens.length > 0 && (
        <button className={styles.clearButton} title="Clear all" onClick={deleteAll}>
          <IconTimes />
        </button>
      )}
    </div>
  )
}

TokenizedSearchField.propTypes = {
  initialValues: PropTypes.arrayOf(PropTypes.array).isRequired,
  onChange: PropTypes.func.isRequired
}

export default TokenizedSearchField
