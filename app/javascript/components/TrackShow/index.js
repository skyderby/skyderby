import React from 'react'
import PropTypes from 'prop-types'

import Header from './Header'
import Navbar from './Navbar'

import styles from './styles.module.scss'

const TrackShow = ({ track, children }) => {
  return (
    <div className={styles.pageContainer}>
      <Header track={track}>
        <Navbar track={track} />
      </Header>

      {children}
    </div>
  )
}

TrackShow.propTypes = {
  track: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired
}
export default TrackShow
