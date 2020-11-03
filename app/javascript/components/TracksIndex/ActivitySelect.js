import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const ActivitySelect = ({ buildUrl, currentActivity }) => (
  <div>
    <Link
      className={styles.activityLink}
      to={location => ({ ...location, search: buildUrl({ page: null, activity: null }) })}
      data-active={!currentActivity}
    >
      All
    </Link>
    <Link
      className={styles.activityLink}
      to={location => ({
        ...location,
        search: buildUrl({ page: null, activity: 'skydive' })
      })}
      data-active={currentActivity === 'skydive'}
    >
      Skydive
    </Link>
    <Link
      className={styles.activityLink}
      to={location => ({
        ...location,
        search: buildUrl({ page: null, activity: 'base' })
      })}
      data-active={currentActivity === 'base'}
    >
      Base
    </Link>
  </div>
)

ActivitySelect.propTypes = {
  buildUrl: PropTypes.func.isRequired,
  currentActivity: PropTypes.string
}

export default ActivitySelect
