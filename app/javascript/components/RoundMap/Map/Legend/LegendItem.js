import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const LegendItem = ({ color, children }) => {
  return (
    <Item>
      <i className="fa fa-circle" style={{ color }} />
      &nbsp; &mdash; &nbsp;
      {children}
    </Item>
  )
}

const Item = styled.div`
  font: 12px/16px 'Proxima Nova Regular';

  i {
    font-size: 10px;
  }
`

LegendItem.propTypes = {
  color: PropTypes.string.isRequired,
  children: PropTypes.node
}

export default LegendItem
