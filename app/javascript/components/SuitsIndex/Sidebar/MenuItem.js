import React from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const MenuItem = ({ title, subtitle, ...props }) => (
  <li>
    <NavLink className={styles.link} {...props}>
      <div className={styles.linkContent}>
        <div className={styles.title}>{title}</div>
        <div className={styles.subtitle}>{subtitle}</div>
      </div>
    </NavLink>
  </li>
)

MenuItem.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string
}

export default MenuItem
