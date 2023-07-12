import React from 'react'
import cx from 'clsx'

import styles from './styles.module.scss'

type ErrorMessageProps = {
  className?: string
  children?: React.ReactNode | React.ReactNode[]
}

const ErrorMessage = ({ className, ...props }: ErrorMessageProps): React.ReactElement => (
  <div className={cx(styles.container, className)} {...props} />
)

export default ErrorMessage
