import React from 'react'
import useTranslation from 'next-translate/useTranslation'

const Index = () => {
  const { t } = useTranslation('common')

  return <h1>Next.js here {t('key')}</h1>
}

export default Index
