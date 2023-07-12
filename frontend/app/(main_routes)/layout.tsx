import React from 'react'
import AppShell from 'components/AppShell'
import { currentLocale } from 'components/useI18n'
import 'styles/globalStyles.scss'

type Props = {
  children: React.ReactNode
}

const RootLayout = ({ children }: Props) => {
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
