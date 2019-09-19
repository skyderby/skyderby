import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { loadRoundMap } from 'redux/events/roundMap'
import { loadReferencePoints } from 'redux/events/referencePoints'
import Container from 'components/ui/FullscreenContainer'
import Map from './Map'
import CompetitorsList from './CompetitorsList'
import LoadingPlaceholder from './LoadingPlaceholder'

const RoundMap = ({ eventId, roundId }) => {
  const dispatch = useDispatch()

  const { isLoading } = useSelector(state => state.eventRoundMap)

  useEffect(() => {
    dispatch(loadRoundMap(eventId, roundId))
    dispatch(loadReferencePoints(eventId))
  }, [eventId, roundId])

  return (
    <Container>
      <Header>Back</Header>
      <MainArea>
        {isLoading ? (
          <LoadingPlaceholder />
        ) : (
          <>
            <Map />
            <CompetitorsList />
          </>
        )}
      </MainArea>
    </Container>
  )
}

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 0 5px;
  flex-shrink: 0;
  flex-grow: 0;
  flex-basis: 40px;
`

const MainArea = styled.div`
  border-top: rgba(0, 0, 0, 0.14) 1px solid;
  display: flex;
  flex-basis: 0;
  flex-grow: 1;
  flex-shrink: 1;
  height: 100%;
`

export default RoundMap
