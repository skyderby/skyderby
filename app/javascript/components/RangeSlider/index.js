import React, { useRef } from 'react'
import { Handles, Tracks, Ticks } from 'react-compound-slider'
import PropTypes from 'prop-types'

import HandleValues from './HandleValues'
import { Slider, Container, Rail, Handle, Track, Tick } from './elements'
import { calculateTicks } from './utils'

const RangeSlider = ({ domain, reversed, values, step = 10, onChange, onUpdate }) => {
  const userTouched = useRef(false)

  const handleSlideStart = () => (userTouched.current = true)

  const handleChange = args => {
    if (userTouched.current) onChange?.(args)
  }

  const handleUpdate = args => {
    if (userTouched.current) onUpdate?.(args)
  }

  return (
    <Container>
      <Slider
        reversed={reversed}
        domain={domain}
        values={values}
        step={step}
        onChange={handleChange}
        onUpdate={handleUpdate}
        onSlideStart={handleSlideStart}
        mode={2}
      >
        <Rail />

        <Handles>
          {({ handles, getHandleProps }) => (
            <div>
              {handles.map(({ id, percent }) => (
                <Handle
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
                <Track
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
                  <Tick
                    key={tick.id}
                    style={{ left: `${tick.percent}%` }}
                    count={ticks.length}
                    major={major}
                  >
                    <span>{tick.value.toFixed()}</span>
                  </Tick>
                )
              })}
            </div>
          )}
        </Ticks>
      </Slider>
    </Container>
  )
}

RangeSlider.propTypes = {
  domain: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func,
  onUpdate: PropTypes.func,
  reversed: PropTypes.bool,
  step: PropTypes.number,
  values: PropTypes.arrayOf(PropTypes.number)
}

export default RangeSlider
