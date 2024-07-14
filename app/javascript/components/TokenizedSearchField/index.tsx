import React, { useRef, useState } from 'react'
import { OnChangeValue } from 'react-select'

import useClickOutside from 'hooks/useClickOutside'
import IconTimes from 'icons/times.svg'
import Token from './Token'
import ValueSelect from './ValueSelect'
import TypeSelect from './TypeSelect'
import { allowedValueKeys, isAllowedValueKey, Mode, TokenTuple, ValueKey } from './types'

import styles from './styles.module.scss'

type TokenizedSearchFieldProps = {
  initialValues?: TokenTuple[]
  onChange: (tokens: TokenTuple[]) => unknown
  exclude?: typeof allowedValueKeys[number]
}

const TokenizedSearchField = ({
  initialValues = [],
  onChange,
  exclude
}: TokenizedSearchFieldProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tokens, setTokens] = useState(initialValues)
  const [mode, setMode] = useState<Mode>('idle')
  const [currentType, setCurrentType] = useState<ValueKey>()

  useClickOutside(containerRef, () => {
    setMode('idle')
  })

  const fireOnChange = (tokens: TokenTuple[]) => onChange?.(tokens)

  const handleBlur = (evt: React.MouseEvent | React.FocusEvent) => {
    if (evt.target !== evt.currentTarget) return

    if (mode === 'idle') {
      setMode('selectType')
    } else {
      setMode('idle')
    }
  }

  const handleTypeSelect = (option: OnChangeValue<{ value: string }, false>) => {
    if (!option) {
      setMode('idle')
      return
    }

    if (!isAllowedValueKey(option.value)) {
      console.warn(
        `Expected value key to be one of [${allowedValueKeys}], but got ${option.value}`
      )
      return
    }

    setCurrentType(option.value)
    setMode('selectValue')
  }

  const deleteAll = () => {
    setTokens([])
    fireOnChange([])
  }

  const deleteByIdx = (deletedIdx: number) => {
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
            <TypeSelect
              aria-label="Select filter criteria"
              onChange={handleTypeSelect}
              exclude={exclude}
            />
          )}

          {mode === 'selectValue' && (
            <ValueSelect
              type={currentType}
              onChange={option => {
                const newSetOfTokens = [...tokens, option]

                setTokens(newSetOfTokens)
                fireOnChange(newSetOfTokens)

                setMode('idle')
              }}
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

export default TokenizedSearchField
