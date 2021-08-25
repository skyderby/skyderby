import React from 'react'
import { AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'

import Item from 'components/TrackListItem'
import Header from './Header'
import styles from './styles.module.scss'

const TrackList = ({ tracks }) => {
  return (
    <div className={styles.container}>
      <div className={styles.table} aria-label="Tracks list">
        <Header />

        <div className={styles.tbody}>
          <AnimatePresence exitBeforeEnter>
            {tracks.map((track, index) => (
              <Item
                key={track.id}
                track={track}
                index={index}
                to={location => ({
                  pathname: `/tracks/${track.id}`,
                  state: { returnTo: { ...location } }
                })}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

TrackList.propTypes = {
  tracks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired
    })
  ).isRequired
}

TrackList.Item = Item

export default TrackList
