import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const List = ({ className, children }) => {
  return <div className={className}>{children}</div>
}

List.propTypes = {
  className: PropTypes.string.isRequired,
  children: PropTypes.node
}

export default styled(List)`
  border-left: solid 2px var(--border-color);
`
