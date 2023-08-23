import React from 'react'

import { usePerformanceCompetitionQuery } from 'api/performanceCompetitions'
import ErrorPage from 'components/ErrorPage'
import styles from './styles.module.scss'

type DownloadsProps = {
  eventId: number
}

const Downloads = ({ eventId }: DownloadsProps) => {
  const { data: event, isSuccess } = usePerformanceCompetitionQuery(eventId)

  if (!isSuccess) return null

  if (!event.permissions.canDownload) return <ErrorPage.Forbidden />

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h2>Open-Event Scoreboard Download</h2>
        <div className={styles.buttons}>
          <a
            className={styles.downloadButton}
            href={`/assets/performance_competitions/${eventId}/scoreboard.xml`}
            rel="nofollow noreferrer"
          >
            ISC format
          </a>
        </div>
      </div>
      <div className={styles.section}>
        <h2>Task (Speed/Distance/Time) Scoreboards Download</h2>
        <div className={styles.buttons}>
          <a
            className={styles.downloadButton}
            href={`/assets/performance_competitions/${eventId}/task_scoreboards`}
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
            href={`/assets/performance_competitions/${eventId}/team_standings.xml`}
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
            href={`/assets/performance_competitions/${eventId}/gps_recordings`}
          >
            ZIP archive
          </a>
        </div>
      </div>
    </div>
  )
}

export default Downloads
