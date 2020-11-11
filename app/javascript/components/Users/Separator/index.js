import React from 'react'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const Separator = ({ children }) => (
  <div className={styles.separator}>
    <div className={styles.separatorLine} />
    <span>{children}</span>
    <div className={styles.separatorLine} />
  </div>
)

Separator.propTypes = {
  children: PropTypes.node
}

export default Separator
