import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const Direction = ({ className, direction }) => (
  <span className={className}>
    <i className="far fa-compass" />
    &nbsp;
    {direction}°
  </span>
)

Direction.propTypes = {
  className: PropTypes.string.isRequired,
  direction: PropTypes.number.isRequired
}

export default styled(Direction)`
  margin-right: 5px;

  i {
    font-size: 10px;
  }
`
