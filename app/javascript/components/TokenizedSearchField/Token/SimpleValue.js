import React, { useRef } from 'react'
import PropTypes from 'prop-types'

import IconTimes from 'icons/times.svg'

import styles from './styles.module.scss'

const SimpleValue = ({ type, value, onClick, onDelete }) => {
  const deleteButtonRef = useRef()

  const handleTokenClick = e => {
    const deleteButtonClicked =
      e.target === deleteButtonRef.current || deleteButtonRef.current.contains(e.target)

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

SimpleValue.propTypes = {
  type: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onDelete: PropTypes.func.isRequired,
  onClick: PropTypes.func
}

export default SimpleValue
