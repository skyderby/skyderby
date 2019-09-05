import { h, Fragment } from 'preact'
import { useEffect } from 'preact/compat'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { loadRound } from 'redux/events/rounds'
import Container from 'components/ui/FullscreenContainer'
import Map from './Map'
import CompetitorsList from './CompetitorsList'
import LoadingPlaceholder from './LoadingPlaceholder'

const RoundMap = ({ eventId, roundId }) => {
  const dispatch = useDispatch()

  const data = useSelector(state => state.eventRounds[`${eventId}/${roundId}`]) || {}
  const { isLoading = false } = data

  useEffect(() => {
    dispatch(loadRound(eventId, roundId))
  }, [eventId, roundId])

  return (
    <Container>
      <Header>Back</Header>
      <MainArea>
        {isLoading ? (
          <LoadingPlaceholder />
        ) : (
          <Fragment>
            <Map data={data} />
            <CompetitorsList groups={data.groups} />
          </Fragment>
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
