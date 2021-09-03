import React, { useRef } from 'react'

import IconTimes from 'icons/times.svg'

import { ValueKey } from 'components/TokenizedSearchField/types'
import styles from './styles.module.scss'

type SimpleValueProps = {
  type: ValueKey
  value: string | number
  onDelete: (e?: React.MouseEvent) => unknown
  onClick?: (e?: React.MouseEvent) => unknown
}

const SimpleValue = ({
  type,
  value,
  onClick,
  onDelete
}: SimpleValueProps): JSX.Element => {
  const deleteButtonRef = useRef<HTMLButtonElement>(null)

  const handleTokenClick = (e: React.MouseEvent) => {
    const deleteButtonClicked =
      e.target === deleteButtonRef.current ||
      deleteButtonRef.current?.contains(e.target as Node)

    if (deleteButtonClicked) {
      onDelete()
    }

    onClick?.()
  }

  const title = `${type}: ${value}`

  return (
    <li className={styles.container} onClick={handleTokenClick} title={title}>
      <div className={styles.type}>{type}</div>
      <div className={styles.value}>
        {value}
        <button
          className={styles.deleteButton}
          title="Delete"
          type="button"
          ref={deleteButtonRef}
        >
          <IconTimes />
        </button>
      </div>
    </li>
  )
}

export default SimpleValue
