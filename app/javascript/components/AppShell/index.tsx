import React from 'react'
import { Outlet } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import { useI18n } from 'components/TranslationsProvider'
import ErrorBoundary from 'components/ErrorBoundary'
import Navbar from './Navbar'
import Footer from './Footer'
import styles from './styles.module.scss'

const AppShell = (): JSX.Element => {
  const { locale } = useI18n()

  return (
    <>
      <Helmet defaultTitle="Skyderby" titleTemplate="%s | Skyderby">
        <html lang={locale} />
      </Helmet>

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
