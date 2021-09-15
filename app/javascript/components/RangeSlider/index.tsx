import React from 'react'
import { SliderProps, Handles, Tracks, Ticks } from 'react-compound-slider'

import Slider from './Slider'
import HandleValues from './HandleValues'
import { calculateTicks } from './utils'
import styles from './styles.module.scss'

const defaultDomain = [0, 100]

const RangeSlider = ({
  domain = defaultDomain,
  reversed,
  values = [],
  step = 10,
  ...props
}: Partial<SliderProps>): JSX.Element => (
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

export default RangeSlider
