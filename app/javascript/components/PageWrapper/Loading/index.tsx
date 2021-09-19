import React from 'react'

import styles from './styles.module.scss'

const PageLoading = (): JSX.Element => (
  <div className={styles.container}>
    <div className={styles.spinner}>
      <div className={styles.outer} />
      <div className={styles.inner} />
    </div>
    <div className={styles.caption}>loading</div>
  </div>
)

export default PageLoading
