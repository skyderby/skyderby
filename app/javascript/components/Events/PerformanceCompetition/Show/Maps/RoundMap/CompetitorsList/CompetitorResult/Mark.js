import React from 'react'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const Mark = ({ color }) => (
  <div className={styles.mark} style={{ ...(color ? { backgroundColor: color } : {}) }} />
)

Mark.propTypes = {
  color: PropTypes.string
}

export default Mark
