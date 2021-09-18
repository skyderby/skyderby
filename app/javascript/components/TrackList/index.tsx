import React, { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Location, LocationDescriptorObject } from 'history'

import Item from 'components/TrackListItem'
import Header from './Header'
import styles from './styles.module.scss'
import { TrackIndexRecord } from 'api/hooks/tracks'

type TrackListProps = {
  tracks: TrackIndexRecord[]
}

const TrackList = ({ tracks }: TrackListProps): JSX.Element => {
  return (
    <div className={styles.container}>
      <div className={styles.table} aria-label="Tracks list">
        <Header />

        <AnimatePresence exitBeforeEnter>
          <motion.div className={styles.tbody} key={tracks.map(t => t.id).join('-')}>
            {tracks.map((track, index) => (
              <Item.Link
                key={track.id}
                track={track}
                delayIndex={index}
                to={(location: Location<unknown>): LocationDescriptorObject<unknown> => ({
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

export default memo(Object.assign(TrackList, { Item }))
