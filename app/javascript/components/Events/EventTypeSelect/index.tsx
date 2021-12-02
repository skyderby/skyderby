import React from 'react'
import { Link } from 'react-router-dom'

import styles from './styles.module.scss'

const EventTypeSelect = (): JSX.Element => {
  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Choose event type</h1>

      <Link to="/events/performance/new" className={styles.card}>
        <h2 className={styles.title}>GPS Performance competition</h2>
        <p className={styles.details}>
          The objective is to fly a single wingsuit in three separate tasks to demonstrate
          a combination of best time, distance and speed.
          <br />
          FAI rules compliant and approved to be used for first category events
        </p>
      </Link>

      <Link to="/events/speed_skydiving/new" className={styles.card}>
        <h2 className={styles.title}>Speed skydiving</h2>
        <p className={styles.details}>
          The objective for the competitors to fly their body as fast as possible to
          achieve the highest average vertical speed through a 3 second window.
          <br />
          FAI rules compliant, but NOT yet approved to be used for first category events.
        </p>
      </Link>

      <Link to="/events/boogie/new" className={styles.card}>
        <h2 className={styles.title}>Boogie</h2>
        <p className={styles.details}>
          The objective is to fly the a single task (currently distance). Competitors
          complete a series of jumps, the average result of specified number of jumps
          counts as competitor result. Organizers specify how many jumps should be
          averaged for total. This number will be the number of obligatory jumps for
          competitors to complete.
        </p>
      </Link>

      <Link to="/events/tournament/new" className={styles.card}>
        <h2 className={styles.title}>Tournament</h2>
        <p className={styles.details}>
          Single elimination tournament. Usually used (but not limited) to score World
          BASE Race competitions.
        </p>
      </Link>

      <Link to="events/series/new" className={styles.card}>
        <h2 className={styles.title}>Cumulative scoreboard</h2>
        <p className={styles.details}>
          Aggregate multiple GPS performance competitions into single cumulative
          scoreboard.
        </p>
      </Link>
    </div>
  )
}

export default EventTypeSelect
