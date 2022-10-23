import React from 'react'

import styles from './styles.module.scss'

type DownloadsProps = {
  eventId: number
}

const Downloads = ({ eventId: eventId }: DownloadsProps): JSX.Element => {
  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h2>Scoreboard (by category) Download</h2>
        <div className={styles.buttons}>
          <a
            className={styles.downloadButton}
            href={`/assets/speed_skydiving_competitions/${eventId}/scoreboard.xml`}
            target="_blank"
            rel="nofollow noreferrer"
          >
            ISC format
          </a>
        </div>
      </div>
      <div className={styles.section}>
        <h2>Open-Event Scoreboard Download</h2>
        <div className={styles.buttons}>
          <a
            className={styles.downloadButton}
            href={`/assets/speed_skydiving_competitions/${eventId}/open_event_scoreboard.xml`}
            target="_blank"
            rel="nofollow noreferrer"
          >
            ISC format
          </a>
        </div>
      </div>
      <div className={styles.section}>
        <h2>Team standings</h2>
        <div className={styles.buttons}>
          <a
            className={styles.downloadButton}
            href={`/assets/speed_skydiving_competitions/${eventId}/team_standings.xml`}
            target="_blank"
            rel="nofollow noreferrer"
          >
            ISC format
          </a>
        </div>
      </div>
      <div className={styles.section}>
        <h2>GPS Recordings</h2>
        <div className={styles.buttons}>
          <a
            className={styles.downloadButton}
            href={`/assets/speed_skydiving_competitions/${eventId}/gps_recordings`}
          >
            ZIP archive
          </a>
        </div>
      </div>
    </div>
  )
}

export default Downloads
