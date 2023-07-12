'use client'

import React, { useState, useRef } from 'react'
import cx from 'clsx'

// import { useI18n } from 'components/TranslationsProvider'
import Dropdown from 'components/Dropdown'
import ChevronDown from 'icons/chevron-down.svg'
import useClickOutside from 'components/useClickOutside'
import styles from './styles.module.scss'

type ApplicationLocale = 'en' | 'ru' | 'it' | 'fr' | 'es' | 'de'

const languageNames: { [locale in ApplicationLocale]: string } = {
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  ru: 'Русский'
}

type LocaleSelectorProps = {
  className?: string
}

const LocaleSelector = ({ className }: LocaleSelectorProps): JSX.Element => {
  const t = txt => txt
  const locale = 'en'
  const changeLocale = () => {}
  const supportedLocales = ['en', 'ru', 'it', 'fr', 'es', 'de']
  // const { t, locale, changeLocale, supportedLocales } = useI18n()
  const [showDropdown, setShowDropdown] = useState(false)
  const referenceElement = useRef<HTMLLIElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useClickOutside([menuRef, referenceElement], () => setShowDropdown(false))

  const toggleDropdown = () => setShowDropdown(val => !val)
  const handleChangeLocaleClick = (newLocale: ApplicationLocale) => {
    changeLocale(newLocale)
    setShowDropdown(false)
    toggleRef.current?.focus()
  }

  return (
    <li className={className} ref={referenceElement}>
      <button
        className={cx(styles.toggle, showDropdown && styles.active)}
        ref={toggleRef}
        onClick={toggleDropdown}
        aria-label={t('general.change_language')}
      >
        <div className={styles.flag} data-locale={locale} />
        <ChevronDown />
      </button>

      {showDropdown && (
        <Dropdown
          referenceElement={referenceElement.current}
          options={{
            placement: 'bottom-end',
            modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
          }}
          ref={menuRef}
        >
          <ul className={styles.localeMenu}>
            {supportedLocales.map(key => (
              <li key={key}>
                <button
                  className={styles.localeButton}
                  onClick={() => handleChangeLocaleClick(key)}
                >
                  {languageNames[key]}
                </button>
              </li>
            ))}
          </ul>
        </Dropdown>
      )}
    </li>
  )
}

export default LocaleSelector
