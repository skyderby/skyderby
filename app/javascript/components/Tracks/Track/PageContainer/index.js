import React from 'react'
import cx from 'clsx'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const TrackShowContainer = ({ children, shrinkToContent = false }) => (
  <div className={cx(styles.container, shrinkToContent && styles.shrinkToContent)}>
    {children}
  </div>
)

const Settings = ({ children }) => <div className={styles.settings}>{children}</div>

TrackShowContainer.propTypes = {
  children: PropTypes.node.isRequired,
  shrinkToContent: PropTypes.bool
}

Settings.propTypes = {
  children: PropTypes.node.isRequired
}

TrackShowContainer.Settings = Settings

export default TrackShowContainer
