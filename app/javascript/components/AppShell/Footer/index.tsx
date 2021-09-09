import React from 'react'

import { useI18n } from 'components/TranslationsProvider'
import styles from './styles.module.scss'

const Footer = (): JSX.Element => {
  const { t } = useI18n()

  return (
    <footer className={styles.container}>
      © 2014 - {new Date().getFullYear()}
      &nbsp;
      {t('application.footer.made_with')}
      &nbsp;😍 &nbsp;
      {t('application.footer.owner')}
    </footer>
  )
}

export default Footer
