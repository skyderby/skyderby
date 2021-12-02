import React from 'react'
import { Link, Outlet } from 'react-router-dom'

import Logo from 'icons/logo.svg'
import styles from './styles.module.scss'

const UsersLayout = (): JSX.Element => (
  <div className={styles.container}>
    <div className={styles.content}>
      <Link to="/" className={styles.home}>
        <Logo />
        Skyderby
      </Link>

      <Outlet />
    </div>
  </div>
)

export default UsersLayout
