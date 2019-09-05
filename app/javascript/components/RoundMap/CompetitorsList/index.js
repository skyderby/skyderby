import { h } from 'preact'
import styled from 'styled-components'

import Group from './Group'

const CompetitorsList = ({ groups = [] }) => {
  return (
    <Container>
      {groups.map((group, idx) => (
        <Group competitors={group} key={idx} number={idx + 1} />
      ))}
    </Container>
  )
}

const Container = styled.div`
  border-left: rgba(0, 0, 0, 0.14) 1px solid;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 370px;
  height: 100%;
  overflow: scroll;
  padding: 15px;
`

export default CompetitorsList
