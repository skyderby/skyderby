import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const BackLink = ({ children, ...props }) => (
  <a {...props}>
    <i className="fa fa-chevron-left"></i>
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

  i {
    font-size: 21px;
  }

  &:hover {
    background-color: #f3f3f3;
    color: #555;
    text-decoration: none;
  }
`
