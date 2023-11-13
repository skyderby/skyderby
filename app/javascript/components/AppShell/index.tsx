import React from 'react'
import { Outlet } from 'react-router-dom'

import ErrorBoundary from 'components/ErrorBoundary'
import Navbar from './Navbar'
import Footer from './Footer'
import styles from './styles.module.scss'
import Loading from 'components/LoadingSpinner'

const AppShell = (): JSX.Element => {
  return (
    <>
      <a className={styles.skipLink} href="#maincontent">
        Skip to main
      </a>

      <div className={styles.container}>
        <Navbar />
        <React.Suspense fallback={<Loading />}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </React.Suspense>
        <Footer />
      </div>
    </>
  )
}

export default AppShell
