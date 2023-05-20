import React from 'react'
import { currentLocale } from 'components/useI18n'
import 'styles/globalStyles.scss'

const RootLayout = ({ children }) => {
  const locale = currentLocale()

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  )
}

export default RootLayout
