import React from 'react'
import Link from 'next/link'

import { currentLocale } from 'components/useI18n'
import Logo from 'icons/logo.svg'
import styles from './layout.module.scss'
import 'styles/globalStyles.scss'

const RootLayout = ({ children }) => {
  const locale = currentLocale()

  return (
    <html lang={locale}>
      <body>
        <div className={styles.container}>
          <div className={styles.content}>
            <Link href="/" className={styles.home}>
              <Logo />
              Skyderby
            </Link>

            {children}
          </div>
        </div>
      </body>
    </html>
  )
}

export default RootLayout
