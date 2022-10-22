import React from 'react'

import styles from './styles.module.scss'

type LoadingSpinnerProps = {
  caption?: string
}

const LoadingSpinner = ({ caption = 'loading' }: LoadingSpinnerProps) => (
  <div className={styles.container}>
    <div className={styles.spinner}>
      <div className={styles.outer} />
      <div className={styles.inner} />
    </div>
    <div className={styles.caption}>{caption}</div>
  </div>
)

export default LoadingSpinner
