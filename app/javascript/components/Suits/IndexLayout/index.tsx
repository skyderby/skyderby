import React from 'react'

import Sidebar from './Sidebar'
import styles from './styles.module.scss'

type IndexLayoutProps = {
  children: React.ReactNode
}

const IndexLayout = ({ children }: IndexLayoutProps): JSX.Element => {
  return (
    <div className={styles.container}>
      <Sidebar />

      <div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}

export default IndexLayout
