import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const defaultColor = '#999'

const Mark = ({ className }) => <i className={`fa fa-circle ${className}`} />

Mark.propTypes = {
  className: PropTypes.string.isRequired
}
export default styled(Mark)`
  color: ${props => props.color || defaultColor};
  font-size: 10px;
  line-height: 21px;
`
