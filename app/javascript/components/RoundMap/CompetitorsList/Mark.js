import { h } from 'preact'
import styled from 'styled-components'

const defaultColor = '#999'

const Mark = ({ className }) => <i className={`fa fa-circle ${className}`} />

export default styled(Mark)`
  color: ${props => props.color || defaultColor};
  font-size: 10px;
  line-height: 21px;
`
