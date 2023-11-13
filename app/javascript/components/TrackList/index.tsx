import React, { memo } from 'react'
import { motion } from 'framer-motion'

import Item from 'components/TrackListItem'
import Header from './Header'
import styles from './styles.module.scss'
import { TrackIndexRecord } from 'api/tracks'
import { useLocation } from 'react-router-dom'

type TrackListProps = {
  tracks: TrackIndexRecord[]
}

const TrackList = ({ tracks }: TrackListProps): JSX.Element => {
  const location = useLocation()

  return (
    <div className={styles.container}>
      <div className={styles.table} aria-label="Tracks list">
        <Header />

        <motion.div className={styles.tbody} key={tracks.map(t => t.id).join('-')}>
          {tracks.map((track, index) => (
            <Item.Link
              key={track.id}
              track={track}
              delayIndex={index}
              to={`/tracks/${track.id}`}
              state={{ returnTo: { ...location } }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default memo(Object.assign(TrackList, { Item }))
