import React, { useRef } from 'react'

import { useSuitQuery } from 'api/hooks/suits'
import { useManufacturerQuery } from 'api/hooks/manufacturer'
import IconTimes from 'icons/times.svg'
import SuitLabel from 'components/SuitLabel'
import styles from './styles.module.scss'

type SuitProps = {
  value: string | number
  onDelete: (e?: React.MouseEvent) => unknown
  onClick?: (e?: React.MouseEvent) => unknown
}

const Suit = ({ value, onClick, onDelete }: SuitProps): JSX.Element | null => {
  const deleteButtonRef = useRef<HTMLButtonElement>(null)
  const suitId = Number(value)
  const { data: suit, isLoading } = useSuitQuery(suitId)
  const { data: make } = useManufacturerQuery(suit?.makeId)

  if (isLoading) return null

  const handleTokenClick = (e: React.MouseEvent) => {
    const deleteButtonClicked =
      e.target === deleteButtonRef.current ||
      deleteButtonRef.current?.contains(e.target as Node)

    if (deleteButtonClicked) {
      onDelete()
    }

    onClick?.()
  }

  const title = `Suit: ${suit?.name}`

  return (
    <li className={styles.suitContainer} onClick={handleTokenClick} title={title}>
      <div className={styles.type}>Suit</div>
      <div className={styles.value}>
        <SuitLabel name={suit?.name} code={make?.code} />
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

export default Suit
