import React from 'react'
import cx from 'clsx'

import styles from './styles.module.scss'

export type Tab = 'charts' | 'jumpRange'

type TagBarProps = {
  currentTab: Tab
  setCurrentTab: React.Dispatch<React.SetStateAction<Tab>>
}

const TabBar = ({ currentTab, setCurrentTab }: TagBarProps): JSX.Element => {
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

export default TabBar
