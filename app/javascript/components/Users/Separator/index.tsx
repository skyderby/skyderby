import React from 'react'

import styles from './styles.module.scss'

type SeparatorProps = {
  children: React.ReactNode
}

const Separator = ({ children }: SeparatorProps): JSX.Element => (
  <div className={styles.separator}>
    <div className={styles.separatorLine} />
    <span>{children}</span>
    <div className={styles.separatorLine} />
  </div>
)

export default Separator
