import React from 'react'
import cx from 'clsx'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const ErrorMessage = ({ className, ...props }) => (
  <div className={cx(styles.container, className)} {...props} />
)

ErrorMessage.propTypes = {
  className: PropTypes.string
}

export default ErrorMessage
