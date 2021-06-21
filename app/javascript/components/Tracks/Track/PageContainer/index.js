import React from 'react'
import cx from 'clsx'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const PageContainer = ({ children, shrinkToContent = false }) => (
  <div className={cx(styles.container, shrinkToContent && styles.shrinkToContent)}>
    {children}
  </div>
)

const Settings = ({ children }) => <div className={styles.settings}>{children}</div>

PageContainer.propTypes = {
  children: PropTypes.node.isRequired,
  shrinkToContent: PropTypes.bool
}

Settings.propTypes = {
  children: PropTypes.node.isRequired
}

PageContainer.Settings = Settings

export default PageContainer
