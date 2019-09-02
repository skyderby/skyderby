import { h } from 'preact'
import styled from 'styled-components'

const Item = ({ className, name }) => {
  return (
    <div className={className}>
      {name}
    </div>
  )
}

export default styled(Item)`
  font-family: 'Proxima Nova Regular',
  padding: 5px 7px;
`
