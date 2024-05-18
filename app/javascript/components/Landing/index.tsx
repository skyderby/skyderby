import React from 'react'

import { useI18n } from 'components/TranslationsProvider'
import styles from './styles.module.scss'

const Home = () => {
  const { t } = useI18n()

  return (
    <div>
      <div className={styles.hero}>
        <div className={styles.darkLayer} />
        <div className={styles.heroText}>{t('static_pages.index.desc')}</div>
        <div className={styles.warningText}>🚧 Work in progress 🚧</div>
      </div>
    </div>
  )
}

export default Home
