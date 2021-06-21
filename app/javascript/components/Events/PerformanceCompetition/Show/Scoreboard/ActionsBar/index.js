import React from 'react'

import PlusIcon from 'icons/plus.svg'
import styles from './styles.module.scss'

const ActionsBar = () => {
  return (
    <ul className={styles.container}>
      <button className={styles.button}>
        <PlusIcon /> &nbsp; Category
      </button>
      <button className={styles.button}>
        <PlusIcon /> &nbsp; Competitor
      </button>
      <button className={styles.button}>
        <PlusIcon /> &nbsp; Round
      </button>
    </ul>
  )
}

export default ActionsBar
