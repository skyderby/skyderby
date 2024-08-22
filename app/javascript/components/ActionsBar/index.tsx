import React from 'react'
import cx from 'clsx'
import styles from './styles.module.scss'

type ActionsBarProps = React.HTMLAttributes<HTMLDivElement>

const ActionsBar = ({ className, ...props }: ActionsBarProps) => (
  <div className={cx(styles.container, className)} {...props} />
)

type ButtonProps = React.HTMLAttributes<HTMLButtonElement>

const Button = ({ className, ...props }: ButtonProps) => (
  <button className={cx(styles.button, className)} {...props} />
)

export default Object.assign(ActionsBar, { Button })
