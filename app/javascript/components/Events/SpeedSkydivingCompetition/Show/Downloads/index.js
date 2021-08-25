import React from 'react'

import styles from './styles.module.scss'

const Downloads = () => {
  return (
    <div className={styles.container}>
      <div>
        <h2>Scoreboard Download</h2>
        <a className={styles.downloadButton}>Excel</a>
        <a className={styles.downloadButton}>ISC format</a>
      </div>
      <div>
        <h2>Open-Event Scoreboard Download</h2>
        <a className={styles.downloadButton}>Excel</a>
        <a className={styles.downloadButton}>ISC format</a>
      </div>
      <div>
        <h2>Team standings</h2>
        <a className={styles.downloadButton}>Excel</a>
        <a className={styles.downloadButton}>ISC format</a>
      </div>
      <div>
        <h2>GPS Recordings</h2> <a className={styles.downloadButton}>zip archive</a>
      </div>
    </div>
  )
}

export default Downloads
