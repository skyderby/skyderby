import React, { useState, useRef } from 'react'

import { useI18n } from 'components/TranslationsProvider'
import Dropdown from 'components/Dropdown'
import ChevronDown from 'icons/chevron-down.svg'
import styles from './styles.module.scss'

const languageNames = {
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  ru: 'Русский'
}

const LocaleSelector = () => {
  const { locale, changeLocale, supportedLocales } = useI18n()
  const [showDropdown, setShowDropdown] = useState(false)
  const [referenceElement, setReferenceElement] = useState(null)
  const toggleRef = useRef()

  const toggleDropdown = () => setShowDropdown(val => !val)
  const handleChangeLocaleClick = newLocale => {
    changeLocale(newLocale)
    setShowDropdown(false)
    toggleRef.current.focus()
  }

  return (
    <li ref={setReferenceElement}>
      <button className={styles.toggle} ref={toggleRef} onClick={toggleDropdown}>
        <div className={styles.flag} data-locale={locale} />
        <ChevronDown />
      </button>

      {showDropdown && (
        <Dropdown
          referenceElement={referenceElement}
          options={{ placement: 'bottom-end' }}
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
