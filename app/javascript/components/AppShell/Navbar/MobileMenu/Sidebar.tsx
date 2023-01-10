import React, { useLayoutEffect } from 'react'
import ReactDOM from 'react-dom'
import { Link, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

import { useCurrentUserQuery } from 'api/sessions'
import { useI18n } from 'components/TranslationsProvider'
import MenuButton from 'components/ui/MenuButton'
import useRoot from 'hooks/useRoot'
import useDocumentBodyScroll from 'hooks/useDocumentBodyScroll'
import LocaleSelector from '../LocaleSelector'
import LogoutButton from '../LogoutButton'
import styles from './styles.module.scss'

type SidebarProps = {
  onToggle: () => unknown
}

const fadeVariants = {
  hidden: {
    opacity: 0,
    transition: { delay: 0.125 }
  },
  present: {
    opacity: 0.75
  }
}

const menuVariants = {
  closed: {
    transform: 'translateX(0px)',
    transition: { duration: 0.3 }
  },
  open: {
    transform: 'translateX(-300px)',
    transition: { delay: 0.25, duration: 0.3 }
  }
}

const Sidebar = ({ onToggle: toggle }: SidebarProps): JSX.Element | null => {
  const { t } = useI18n()
  const sidebarRoot = useRoot('sidebar-root')
  const { enableScroll, disableScroll } = useDocumentBodyScroll()
  const { data: currentUser, isLoading } = useCurrentUserQuery()

  useLayoutEffect(() => {
    disableScroll()

    return () => enableScroll()
  })

  return ReactDOM.createPortal(
    <div className={styles.sidebarContainer}>
      <motion.div
        className={styles.fade}
        variants={fadeVariants}
        initial="hidden"
        animate="present"
        exit="hidden"
      />
      <motion.div
        className={styles.sidebar}
        variants={menuVariants}
        initial="closed"
        animate="open"
        exit="closed"
      >
        <div className={styles.sidebarTitle}>
          <ul className={styles.titleMenu}>
            {currentUser?.authorized && (
              <li>
                <LogoutButton />
              </li>
            )}
            <LocaleSelector className={styles.menuItem} />
            <li>
              <MenuButton active onClick={toggle} />
            </li>
          </ul>
        </div>
        <ul className={styles.menu}>
          <li className={styles.menuItem}>
            <NavLink to="/tracks" onClick={toggle}>
              {t('application.header.tracks')}
            </NavLink>
          </li>
          <li className={styles.menuItem}>
            <NavLink to="/events" onClick={toggle}>
              {t('application.header.competitions')}
            </NavLink>
          </li>
          <li className={styles.menuItem}>
            <NavLink to="/online_rankings" onClick={toggle}>
              {t('application.header.online_competitions')}
            </NavLink>
          </li>
          <li className={styles.menuItem} onClick={toggle}>
            <NavLink to="/places">{t('application.header.places')}</NavLink>
          </li>
          <li className={styles.menuItem} onClick={toggle}>
            <NavLink to="/flight_profiles">{t('flight_profiles.title')}</NavLink>
          </li>
          {!isLoading && !currentUser?.authorized && (
            <li className={styles.menuAction} onClick={toggle}>
              <Link to="/users/sign-in" className={styles.menuButton}>
                {t('devise.shared.links.sign_in')}
              </Link>
            </li>
          )}
        </ul>
      </motion.div>
    </div>,
    sidebarRoot
  )
}

export default Sidebar
