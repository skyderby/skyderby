import React from 'react'
import cx from 'clsx'
import PropTypes from 'prop-types'

import ErrorBoundary from 'components/ErrorBoundary'
import Navbar from './Navbar'
import Footer from './Footer'
import styles from './styles.module.scss'

const AppShell = ({ fullScreen, children }) => {
  return (
    <div className={cx(styles.container, fullScreen && styles.fullScreen)}>
      <Navbar />
      <ErrorBoundary>{children}</ErrorBoundary>
      <Footer />
    </div>
  )
}

AppShell.propTypes = {
  fullScreen: PropTypes.bool,
  children: PropTypes.node.isRequired
}

export default AppShell
