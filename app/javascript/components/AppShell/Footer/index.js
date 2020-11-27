import React from 'react'

import { useI18n } from 'components/TranslationsProvider'
import styles from './styles.module.scss'

const Footer = () => {
  const { t } = useI18n()

  return (
    <div className={styles.container}>
      © 2014 - {new Date().getFullYear()}
      &nbsp;
      {t('application.footer.made_with')}
      &nbsp;😍&nbsp;
      {t('application.footer.owner')}
    </div>
  )
}

export default Footer
