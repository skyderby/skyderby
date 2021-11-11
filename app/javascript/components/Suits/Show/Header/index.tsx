import React from 'react'
import { NavLink } from 'react-router-dom'

import styles from './styles.module.scss'
import { SuitRecord } from 'api/suits'
import { ManufacturerRecord } from 'api/manufacturer'

type HeaderProps = {
  suit: SuitRecord
  make: ManufacturerRecord
}

const Header = ({ suit, make }: HeaderProps): JSX.Element => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{suit.name}</h2>
      <small className={styles.subtitle}>{make.name}</small>

      <div className={styles.navbar}>
        <NavLink exact to={`/suits/${suit.id}`} className={styles.navbarLink}>
          <div>Overview</div>
        </NavLink>
        <NavLink to={`/suits/${suit.id}/videos`} className={styles.navbarLink}>
          <div>Videos</div>
        </NavLink>
        <NavLink to={`/suits/${suit.id}/tracks`} className={styles.navbarLink}>
          <div>Tracks</div>
        </NavLink>

        {suit.editable && (
          <>
            <div className={styles.spacer} />

            <NavLink to={`/suits/${suit.id}/edit`} className={styles.navbarLink}>
              <div>Edit</div>
            </NavLink>
          </>
        )}
      </div>
    </div>
  )
}

export default Header
