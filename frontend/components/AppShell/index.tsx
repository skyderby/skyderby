import React from 'react'

import Navbar from './Navbar'
import Footer from './Footer'
import styles from './styles.module.scss'

const AppShell = ({ children }) => {
  return (
    <>
      <a className={styles.skipLink} href="#maincontent">
        Skip to main
      </a>

      <div className={styles.container}>
        <Navbar />
        {children}
        <Footer />
      </div>
    </>
  )
}

export default AppShell
