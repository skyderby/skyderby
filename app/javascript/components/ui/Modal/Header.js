import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import CloseButton from './CloseButton'

const Header = ({ className, title, handleHide }) => {
  return (
    <div className={className}>
      {title}
      <CloseButton onClick={handleHide} />
    </div>
  )
}

Header.propTypes = {
  className: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  handleHide: PropTypes.func.isRequired
}

export default styled(Header)`
  display: flex;
  border-bottom: 1px solid var(--border-color);
  padding: 10px 15px;
`
