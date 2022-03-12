import React from 'react'

import styles from './styles.module.scss'

type MarkProps = {
  color: string
}

const Mark = ({ color }: MarkProps) => (
  <div className={styles.mark} style={{ ...(color ? { backgroundColor: color } : {}) }} />
)

export default Mark
