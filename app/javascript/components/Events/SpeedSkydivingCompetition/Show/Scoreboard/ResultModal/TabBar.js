import React from 'react'
import cx from 'clsx'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const TabBar = ({ currentTab, setCurrentTab }) => {
  return (
    <div className={styles.tabBar}>
      <button
        className={cx(styles.tabBarButton, currentTab === 'charts' && styles.activeTab)}
        onClick={() => setCurrentTab('charts')}
      >
        Charts
      </button>
      <button
        className={cx(
          styles.tabBarButton,
          currentTab === 'jumpRange' && styles.activeTab
        )}
        onClick={() => setCurrentTab('jumpRange')}
      >
        Jump Range
      </button>
    </div>
  )
}

TabBar.propTypes = {
  currentTab: PropTypes.oneOf(['charts', 'jumpRange']).isRequired,
  setCurrentTab: PropTypes.func.isRequired
}

export default TabBar
