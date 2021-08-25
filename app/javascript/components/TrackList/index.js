import React, { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'

import Item from 'components/TrackListItem'
import Header from './Header'
import styles from './styles.module.scss'

const TrackList = ({ tracks }) => {
  return (
    <div className={styles.container}>
      <div className={styles.table} aria-label="Tracks list">
        <Header />

        <AnimatePresence exitBeforeEnter>
          <motion.div className={styles.tbody} key={tracks.map(t => t.id).join('-')}>
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
          </motion.div>
        </AnimatePresence>
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

export default memo(TrackList)
