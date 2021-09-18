import React from 'react'
import cx from 'clsx'

import styles from './styles.module.scss'

type PageContainerProps = {
  children: React.ReactNode | React.ReactNode[]
  shrinkToContent?: boolean
}

const PageContainer = ({
  children,
  shrinkToContent = false
}: PageContainerProps): JSX.Element => (
  <div className={cx(styles.container, shrinkToContent && styles.shrinkToContent)}>
    {children}
  </div>
)

type SettingsProps = {
  children: React.ReactNode | React.ReactNode[]
}

const Settings = ({ children }: SettingsProps): JSX.Element => (
  <div className={styles.settings}>{children}</div>
)

PageContainer.Settings = Settings

export default PageContainer
