import React from 'react'
import cx from 'clsx'
import { Helmet } from 'react-helmet'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import ErrorBoundary from 'components/ErrorBoundary'
import Navbar from './Navbar'
import Footer from './Footer'
import styles from './styles.module.scss'

const AppShell = ({ fullScreen, children }) => {
  const { locale } = useI18n()

  return (
    <>
      <Helmet defaultTitle="Skyderby" titleTemplate="%s | Skyderby">
        <html lang={locale} />
      </Helmet>

      <a className={styles.skipLink} href="#maincontent">
        Skip to main
      </a>

      <div className={cx(styles.container, fullScreen && styles.fullScreen)}>
        <Navbar />
        <ErrorBoundary>{children}</ErrorBoundary>
        <Footer />
      </div>
    </>
  )
}

AppShell.propTypes = {
  fullScreen: PropTypes.bool,
  children: PropTypes.node.isRequired
}

export default AppShell
