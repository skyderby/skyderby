import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { useTracksInfiniteQuery } from 'api/hooks/tracks'
import Item from 'components/TrackListItem'
import TokenizedSearchField from 'components/TokenizedSearchField'
import usePageParams from 'components/FlightProfiles/usePageParams'
import styles from './styles.module.scss'

const TrackList = () => {
  const {
    params: { tracksParams, selectedTracks },
    updateFilters,
    toggleTrack
  } = usePageParams()

  const { data, fetchNextPage, isFetchingNextPage } = useTracksInfiniteQuery({
    ...tracksParams,
    activity: 'base'
  })

  const tracks = (data?.pages || []).reduce((acc, page) => acc.concat(page.items), [])

  const handleListScroll = e => {
    if (isFetchingNextPage) return

    const element = e.target
    const scrollPercent =
      ((element.scrollTop + element.clientHeight) / element.scrollHeight) * 100

    if (scrollPercent > 85) fetchNextPage()
  }

  return (
    <div className={styles.container} onScroll={handleListScroll}>
      <TokenizedSearchField
        initialValues={tracksParams.filters}
        onChange={updateFilters}
      />

      <AnimatePresence exitBeforeEnter>
        {tracks.map((track, index) => (
          <Item
            compact
            key={track.id}
            as={motion.div}
            track={track}
            delayIndex={data.pages.length === 1 ? index : 0}
            data-active={selectedTracks.includes(track.id)}
            onClick={() => toggleTrack(track.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default TrackList
