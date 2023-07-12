import React from 'react'
import useI18n from 'components/useI18n'
import translations from './translations.json'
import styles from './styles.module.scss'

const LandingPage = () => {
  const { t } = useI18n(translations)

  return (
    <div>
      <div className={styles.hero}>
        <div className={styles.darkLayer} />
        <div className={styles.heroText}>{t('app_description')}</div>
        <div className={styles.warningText}>🚧 Work in progress 🚧</div>
      </div>
    </div>
  )
}

export default LandingPage
