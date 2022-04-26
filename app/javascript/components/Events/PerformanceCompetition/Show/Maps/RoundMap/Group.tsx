import React from 'react'

import styles from './styles.module.scss'

type GroupProps =
  {
  name: string
  selectable: true
  onToggle: () => unknown
  children: React.ReactNode
}
| {
  name: string
  selectable: false
  onToggle?: undefined
  children: React.ReactNode
}

const Group = ({ name, selectable, children, onToggle: toggleGroup }: GroupProps) => (
  <div className={styles.group}>
    <div className={styles.header}>
      <span>{name}</span>
      {selectable && (
        <button className={styles.flatButton} onClick={toggleGroup}>
          Select
        </button>
      )}
    </div>
    <div className={styles.list}>{children}</div>
  </div>
)

export default Group
