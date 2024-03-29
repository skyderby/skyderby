import React from 'react'
import { Link, useLocation } from 'react-router-dom'

import { IndexParams, TrackActivity } from 'api/tracks'
import styles from './styles.module.scss'

type ActivitySelectProps = {
  buildUrl: (params: IndexParams) => string
  currentActivity: TrackActivity | undefined
}

const ActivitySelect = ({
  buildUrl,
  currentActivity
}: ActivitySelectProps): JSX.Element => {
  const location = useLocation()

  return (
    <div>
      <Link
        className={styles.activityLink}
        to={{
          ...location,
          search: buildUrl({ page: 1, activity: undefined })
        }}
        data-active={!currentActivity}
      >
        All
      </Link>
      <Link
        className={styles.activityLink}
        to={{
          ...location,
          search: buildUrl({ page: 1, activity: 'skydive' })
        }}
        data-active={currentActivity === 'skydive'}
      >
        Skydive
      </Link>
      <Link
        className={styles.activityLink}
        to={{
          ...location,
          search: buildUrl({ page: 1, activity: 'base' })
        }}
        data-active={currentActivity === 'base'}
      >
        Base
      </Link>
    </div>
  )
}

export default ActivitySelect
