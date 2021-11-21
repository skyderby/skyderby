import React from 'react'
import cx from 'clsx'
import { Helmet } from 'react-helmet'

import { useI18n } from 'components/TranslationsProvider'
import ErrorBoundary from 'components/ErrorBoundary'
import Navbar from './Navbar'
import Footer from './Footer'
import styles from './styles.module.scss'

type AppShellProps = {
  fullScreen?: boolean
}

const AppShell = ({
  fullScreen,
  children
}: React.PropsWithChildren<AppShellProps>): JSX.Element => {
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

export default AppShell
