import React from 'react'
import { Outlet } from 'react-router-dom'

import ErrorBoundary from 'components/ErrorBoundary'
import Navbar from './Navbar'
import Footer from './Footer'
import styles from './styles.module.scss'

const AppShell = (): JSX.Element => {
  return (
    <>
      <a className={styles.skipLink} href="#maincontent">
        Skip to main
      </a>

      <div className={styles.container}>
        <Navbar />
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
        <Footer />
      </div>
    </>
  )
}

export default AppShell
