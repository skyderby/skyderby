import React from 'react'

import styles from './styles.module.scss'

const LoadingIndicator = () => {
  return (
    <div className={styles.loadingContainer}>
      <span className={styles.loadingDot} />
      <span className={styles.loadingDot} />
      <span className={styles.loadingDot} />
    </div>
  )
}

export default LoadingIndicator
