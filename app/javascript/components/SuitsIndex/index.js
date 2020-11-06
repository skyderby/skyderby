import React from 'react'
import PropTypes from 'prop-types'

import Sidebar from './Sidebar'

import styles from './styles.module.scss'

const SuitsIndex = ({ children }) => {
  return (
    <div className={styles.container}>
      <Sidebar />

      <div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}

SuitsIndex.propTypes = {
  children: PropTypes.node.isRequired
}

export default SuitsIndex
