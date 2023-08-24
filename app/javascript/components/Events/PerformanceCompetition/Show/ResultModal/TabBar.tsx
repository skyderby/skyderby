import React from 'react'
import cx from 'clsx'

import styles from './styles.module.scss'

const tabs = ['charts', 'jumpRange', 'penalties'] as const
export type Tab = typeof tabs[number]

type TagBarProps = {
  currentTab: Tab
  setCurrentTab: React.Dispatch<React.SetStateAction<Tab>>
}

const TabBar = ({ currentTab, setCurrentTab }: TagBarProps): JSX.Element => {
  const tabTitles = {
    charts: 'Charts',
    jumpRange: 'Jump Range',
    penalties: 'Penalties'
  }

  return (
    <div className={styles.tabBar}>
      {tabs.map(tab => (
        <button
          key={tab}
          className={cx(styles.tabBarButton, currentTab === tab && styles.activeTab)}
          onClick={() => setCurrentTab(tab)}
        >
          {tabTitles[tab]}
        </button>
      ))}
    </div>
  )
}

export default TabBar
