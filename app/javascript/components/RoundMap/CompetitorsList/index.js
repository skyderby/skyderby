import React from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'

import Group from './Group'

const CompetitorsList = () => {
  const groups = useSelector(state => state.eventRound.groups)

  if (!groups) return null

  return (
    <Container>
      {groups.map((resultIds, idx) => (
        <Group key={idx} number={idx + 1} resultIds={resultIds} />
      ))}
    </Container>
  )
}

const Container = styled.div`
  border-left: solid 1px var(--border-color);
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 370px;
  height: 100%;
  overflow: scroll;
  padding: 10px;
`

export default CompetitorsList
