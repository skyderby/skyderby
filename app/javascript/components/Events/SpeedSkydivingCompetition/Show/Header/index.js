import React from 'react'
import PropTypes from 'prop-types'

import PlaceLabel from 'components/PlaceLabel'
import Navbar from './Navbar'
import styles from './styles.module.scss'

const Header = ({ event }) => {
  if (!event) return null

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.eventName}>{event.name}</h2>
        <PlaceLabel withIcon withMsl placeId={event.placeId} />
      </div>
      <Navbar event={event} />
    </div>
  )
}

Header.propTypes = {
  event: PropTypes.shape({
    name: PropTypes.string.isRequired,
    placeId: PropTypes.number.isRequired
  })
}

export default Header
