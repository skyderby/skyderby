import React from 'react'
import AppShell from 'components/AppShell'
import { currentLocale } from 'components/useI18n'
import 'styles/globalStyles.scss'

const RootLayout = ({ children }) => {
  const locale = currentLocale()

  return (
    <html lang={locale}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}

export default RootLayout
