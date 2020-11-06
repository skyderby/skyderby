import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { loadSuit, createSuitSelector } from 'redux/suits'
import IconTimes from 'icons/times.svg'
import SuitLabel from 'components/SuitLabel'

import styles from './styles.module.scss'

const Suit = ({ value, onClick, onDelete }) => {
  const dispatch = useDispatch()
  const deleteButtonRef = useRef()

  useEffect(() => {
    dispatch(loadSuit(value))
  }, [dispatch, value])

  const data = useSelector(createSuitSelector(value))

  if (!data) return null

  const handleTokenClick = e => {
    const deleteButtonClicked =
      e.target === deleteButtonRef.current || deleteButtonRef.current.contains(e.target)

    if (deleteButtonClicked) {
      onDelete()
    }

    onClick?.()
  }

  const title = `Suit: ${data.name}`

  return (
    <li className={styles.suitContainer} onClick={handleTokenClick} title={title}>
      <div className={styles.type}>Suit</div>
      <div className={styles.value}>
        <SuitLabel name={data.name} code={data.make?.code} />
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
