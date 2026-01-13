import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const BackLink = ({ children, ...props }) => (
  <a {...props}>
    <span className="icon icon--angle-left-solid" aria-hidden="true"></span>
    &nbsp;
    {children}
  </a>
)

BackLink.propTypes = {
  children: PropTypes.node
}
export default styled(BackLink)`
  color: #555;
  border-radius: 4px;
  font-family: 'Proxima Nova Regular';
  font-size: 24px;
  padding: 0px 12px 0px 10px;

  .icon {
    --icon-size: 21px;
  }

  &:hover {
    background-color: #f3f3f3;
    color: #555;
    text-decoration: none;
  }
`
