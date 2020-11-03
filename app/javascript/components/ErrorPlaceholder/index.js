import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const ErrorPlaceholder = ({ title, description, linkBack }) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>

      {linkBack && (
        <Link to={linkBack} className={styles.primaryButton}>
          Go back
        </Link>
      )}
    </div>
  )
}

ErrorPlaceholder.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  linkBack: PropTypes.string
}

export default ErrorPlaceholder
