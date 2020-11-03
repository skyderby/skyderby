import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import Logo from 'icons/logo'
import styles from './styles.module.scss'

const PageWrapper = ({ children }) => (
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

PageWrapper.propTypes = {
  children: PropTypes.node.isRequired
}

export default PageWrapper
