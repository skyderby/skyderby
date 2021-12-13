import React, { useCallback, useState } from 'react'
import { AnimatePresence } from 'framer-motion'

import MenuButton from 'components/ui/MenuButton'
import Sidebar from './Sidebar'
import styles from './styles.module.scss'

const Index = (): JSX.Element => {
  const [active, setActive] = useState(false)
  const toggleSidebar = useCallback(() => setActive(prevState => !prevState), [setActive])

  return (
    <>
      <ul className={styles.mainHeaderItems}>
        <li>
          <MenuButton active={active} onClick={toggleSidebar} />
        </li>
      </ul>
      <AnimatePresence>{active && <Sidebar onToggle={toggleSidebar} />}</AnimatePresence>
    </>
  )
}

export default Index
