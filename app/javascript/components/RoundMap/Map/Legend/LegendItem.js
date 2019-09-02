import { h } from 'preact'
import styled from 'styled-components'

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
`

export default LegendItem
