import React, { useRef } from 'react'
import PropTypes from 'prop-types'

import { useSuitQuery } from 'api/hooks/suits'
import { useManufacturerQuery } from 'api/hooks/manufacturer'
import IconTimes from 'icons/times.svg'
import SuitLabel from 'components/SuitLabel'
import styles from './styles.module.scss'

const Suit = ({ value, onClick, onDelete }) => {
  const deleteButtonRef = useRef()

  const { data: suit, isLoading } = useSuitQuery(value)
  const { data: make } = useManufacturerQuery(suit?.makeId)

  if (isLoading) return null

  const handleTokenClick = e => {
    const deleteButtonClicked =
      e.target === deleteButtonRef.current || deleteButtonRef.current.contains(e.target)

    if (deleteButtonClicked) {
      onDelete()
    }

    onClick?.()
  }

  const title = `Suit: ${suit.name}`

  return (
    <li className={styles.suitContainer} onClick={handleTokenClick} title={title}>
      <div className={styles.type}>Suit</div>
      <div className={styles.value}>
        <SuitLabel name={suit.name} code={make.code} />
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

Suit.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onDelete: PropTypes.func.isRequired,
  onClick: PropTypes.func
}

export default Suit
