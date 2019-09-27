import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const LoadingPlaceholder = ({ className }) => (
  <div className={className}>
    <p>
      <i className="fa fa-spin fa-circle-notch" />
    </p>
    <p>
      <span>Loading...</span>
    </p>
  </div>
)

LoadingPlaceholder.propTypes = {
  className: PropTypes.string.isRequired
}

export default styled(LoadingPlaceholder)`
  color: #777;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
  padding-bottom: 10vh;
  text-align: center;

  p {
    margin: 0;
  }

  i {
    font-size: 48px;
  }

  span {
    line-height: 2.5;
    font-size: 32px;
  }
`
