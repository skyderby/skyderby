import React from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const Header = ({ suit, make }) => {
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

Header.propTypes = {
  suit: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    editable: PropTypes.bool.isRequired
  }).isRequired,
  make: PropTypes.shape({
    name: PropTypes.string.isRequired
  })
}

export default Header
