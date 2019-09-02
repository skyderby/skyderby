import { h } from 'preact'
import styled from 'styled-components'

import Item from './Item'

const List = ({ className, competitors }) => {
  return (
    <div className={className}>
      {competitors.map((el, idx) => (
        <Item {...el} key={idx} />
      ))}
    </div>
  )
}

export default styled(List)`
  border-left: #ccc 2px solid;
`
