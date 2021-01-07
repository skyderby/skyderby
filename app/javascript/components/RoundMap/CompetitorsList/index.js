import React from 'react'
import { useSelector } from 'react-redux'

import Group from './Group'
import styles from './styles.module.scss'

const CompetitorsList = () => {
  const groups = useSelector(state => state.eventRound.groups)

  if (!groups) return null

  return (
    <aside className={styles.container}>
      {groups.map((resultIds, idx) => (
        <Group key={idx} number={idx + 1} resultIds={resultIds} />
      ))}
    </aside>
  )
}

export default CompetitorsList
