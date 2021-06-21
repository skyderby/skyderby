import React from 'react'
import { Handles, Tracks, Ticks } from 'react-compound-slider'
import PropTypes from 'prop-types'

import Slider from './Slider'
import HandleValues from './HandleValues'
import { calculateTicks } from './utils'
import styles from './styles.module.scss'

const RangeSlider = ({ domain, reversed, values, step = 10, ...props }) => {
  return (
    <div className={styles.container}>
      <Slider
        className={styles.slider}
        reversed={reversed}
        domain={domain}
        values={values}
        step={step}
        mode={2}
        {...props}
      >
        <div className={styles.rail} />

        <Handles>
          {({ handles, getHandleProps }) => (
            <div>
              {handles.map(({ id, percent }) => (
                <div
                  className={styles.handle}
                  key={`handle-${id}`}
                  style={{ left: `${percent}%` }}
                  {...getHandleProps(id)}
                />
              ))}
              <HandleValues handles={handles} />
            </div>
          )}
        </Handles>

        <Tracks left={false} right={false}>
          {({ tracks, getTrackProps }) => (
            <div>
              {tracks.map(({ id, source, target }) => (
                <div
                  className={styles.track}
                  key={id}
                  style={{
                    left: `${source.percent}%`,
                    width: `${target.percent - source.percent}%`
                  }}
                  {...getTrackProps()}
                />
              ))}
            </div>
          )}
        </Tracks>

        <Ticks values={calculateTicks(domain)}>
          {({ ticks }) => (
            <div>
              {ticks.map(tick => {
                const major = domain.includes(tick.value) || tick.value % 500 === 0

                return (
                  <div
                    className={styles.tick}
                    key={tick.id}
                    style={{ left: `${tick.percent}%` }}
                    count={ticks.length}
                    data-major={major}
                  >
                    <span>{tick.value.toFixed()}</span>
                  </div>
                )
              })}
            </div>
          )}
        </Ticks>
      </Slider>
    </div>
  )
}

RangeSlider.propTypes = {
  domain: PropTypes.arrayOf(PropTypes.number).isRequired,
  reversed: PropTypes.bool,
  step: PropTypes.number,
  values: PropTypes.arrayOf(PropTypes.number)
}

export default RangeSlider
