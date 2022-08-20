import React from 'react'
import { AnimatePresence } from 'framer-motion'

import {
  useTracksInfiniteQuery,
  TrackActivity,
  IndexParams,
  FilterTuple
} from 'api/tracks'
import Item from 'components/TrackListItem'
import TokenizedSearchField from 'components/TokenizedSearchField'
import styles from './styles.module.scss'

type TrackListProps = {
  activity: TrackActivity
  tracksParams: Omit<IndexParams, 'filters'> & { filters: FilterTuple[] }
  selectedTracks: number[]
  onFilterChange: (filters: FilterTuple[]) => void
  onTrackToggle: (id: number) => void
}

const TrackList = ({
  activity,
  tracksParams,
  selectedTracks,
  onFilterChange,
  onTrackToggle
}: TrackListProps): JSX.Element => {
  const { data, fetchNextPage, isFetchingNextPage } = useTracksInfiniteQuery({
    ...tracksParams,
    activity
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
        onChange={onFilterChange}
      />

      <AnimatePresence>
        {pages.map(({ items: tracks }, idx) => (
          <React.Fragment key={idx}>
            {tracks.map((track, index) => (
              <Item.Button
                compact
                key={track.id}
                track={track}
                delayIndex={pages.length === 1 ? index : 0}
                active={selectedTracks.includes(track.id)}
                onClick={() => onTrackToggle(track.id)}
              />
            ))}
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default TrackList
