import React, { ButtonHTMLAttributes } from 'react'
import cx from 'clsx'

import styles from './styles.module.scss'

interface TabProps
  extends React.DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  active: boolean
}

const Tab = ({ active, ...props }: TabProps) => (
  <button className={cx(styles.tabBarButton, active && styles.activeTab)} {...props} />
)

type TabBarProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>

const TabBar = (props: TabBarProps) => <div className={styles.tabBar} {...props} />

TabBar.Tab = Tab

export default TabBar
