import { h } from 'preact'
import styled from 'styled-components'

const Direction = ({ className, direction }) => (
  <span className={className}>
    <i className="far fa-compass" />
    &nbsp;
    {direction}°
  </span>
)

export default styled(Direction)`
  margin-right: 5px;

  i {
    font-size: 10px;
  }
`
