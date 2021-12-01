import React from 'react'
import { Link } from 'react-router-dom'

import Logo from 'icons/logo.svg'
import styles from './styles.module.scss'

type PageWrapperProps = {
  children: React.ReactNode
}

const UsersLayout = ({ children }: PageWrapperProps): JSX.Element => (
  <div className={styles.container}>
    <div className={styles.content}>
      <Link to="/" className={styles.home}>
        <Logo />
        Skyderby
      </Link>

      {children}
    </div>
  </div>
)

export default UsersLayout
