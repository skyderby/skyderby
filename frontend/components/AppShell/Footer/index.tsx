import React from 'react'

import useI18n from 'components/useI18n'
import translations from './translations'
import styles from './styles.module.scss'

const Footer = (): JSX.Element => {
  const { t } = useI18n(translations)

  return (
    <footer className={styles.container}>
      © 2014 - {new Date().getFullYear()}
      &nbsp;
      {t('caption')}
    </footer>
  )
}

export default Footer
