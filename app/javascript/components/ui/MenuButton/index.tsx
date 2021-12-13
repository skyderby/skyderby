import React from 'react'
import cx from 'clsx'

import styles from './styles.module.scss'

type MenuButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }

const MenuButton = ({ className, active, ...props }: MenuButtonProps): JSX.Element => (
  <button
    className={cx(styles.menuButton, className, active && styles.active)}
    {...props}
  >
    <div />
    <div />
    <div />
    <div />
  </button>
)

export default MenuButton
