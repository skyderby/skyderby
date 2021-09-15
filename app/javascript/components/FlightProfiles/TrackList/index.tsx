import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { useTracksInfiniteQuery } from 'api/hooks/tracks'
import Item from 'components/TrackListItem'
import TokenizedSearchField from 'components/TokenizedSearchField'
import usePageParams from 'components/FlightProfiles/usePageParams'
import styles from './styles.module.scss'

const TrackList = (): JSX.Element => {
  const {
    params: { tracksParams, selectedTracks },
    updateFilters,
    toggleTrack
  } = usePageParams()

  const { data, fetchNextPage, isFetchingNextPage } = useTracksInfiniteQuery({
    ...tracksParams,
    activity: 'base'
  })

  const pages = data?.pages || []

  const handleListScroll = (e: React.UIEvent) => {
    if (isFetchingNextPage) return

    const element = e.target as HTMLDivElement
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

      <AnimatePresence>
        {pages.map(({ items: tracks }, idx) => (
          <React.Fragment key={idx}>
            {tracks.map((track, index) => (
              <Item<HTMLDivElement>
                compact
                key={track.id}
                as="div"
                track={track}
                delayIndex={pages.length === 1 ? index : 0}
                active={selectedTracks.includes(track.id)}
                onClick={() => toggleTrack(track.id)}
              />
            ))}
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default TrackList
