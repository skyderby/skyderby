import React from 'react'
import PropTypes from 'prop-types'

import ErrorBoundary from 'components/ErrorBoundary'
import Navbar from './Navbar'
import styles from './styles.module.scss'

const AppShell = ({ children }) => {
  return (
    <div className={styles.container}>
      <Navbar />

      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
  )
}

AppShell.propTypes = {
  children: PropTypes.node.isRequired
}

export default AppShell
