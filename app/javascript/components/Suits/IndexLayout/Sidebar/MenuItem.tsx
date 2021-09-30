import React from 'react'
import { NavLink, NavLinkProps } from 'react-router-dom'

import styles from './styles.module.scss'

type MenuItemProps = NavLinkProps & {
  title: string
  subtitle?: string
}

const MenuItem = ({ title, subtitle, ...props }: MenuItemProps): JSX.Element => (
  <li>
    <NavLink className={styles.link} {...props}>
      <div className={styles.linkContent}>
        <div className={styles.title}>{title}</div>
        <div className={styles.subtitle}>{subtitle}</div>
      </div>
    </NavLink>
  </li>
)

export default MenuItem
