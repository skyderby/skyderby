import React, { useState } from 'react'
import TrackList from 'components/TrackListSidebar'
import Player from 'components/WingsuitPerformancePlayer'
import PlayIcon from 'icons/play.svg'
import usePageParams from './usePageParams'
import TaskMenu from './TaskMenu'
import styles from './styles.module.scss'

const Replay = () => {
  const {
    params: { activity, task, tracksParams, selectedTracks },
    setTask,
    updateFilters,
    toggleTrack
  } = usePageParams()
  const [playing, setPlaying] = useState(false)

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <TaskMenu activity={activity} task={task} onChange={setTask} />
        <button className={styles.button} onClick={() => setPlaying(val => !val)}>
          <PlayIcon />
        </button>
      </div>
      <aside>
        <TrackList
          activity={activity}
          tracksParams={tracksParams}
          selectedTracks={selectedTracks}
          onFilterChange={updateFilters}
          onTrackToggle={toggleTrack}
        />
      </aside>
      <main className={styles.chart}>
        <Player
          windowStart={3000}
          windowEnd={2000}
          playing={playing}
          cardsPosition="bottom"
          task={task}
          group={selectedTracks.map(trackId => ({
            id: trackId,
            profile: { name: 'Dmitry Podoryashy #' + trackId },
            result: { trackId }
          }))}
        />
      </main>
    </div>
  )
}

export default Replay
