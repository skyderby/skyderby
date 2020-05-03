import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { loadRoundMap } from 'redux/events/round'
import { Container, Header } from 'components/ui/FullscreenContainer'
import BackLink from 'components/ui/BackLink'
import Map from './Map'
import CompetitorsList from './CompetitorsList'
import LoadingPlaceholder from './LoadingPlaceholder'

const RoundMap = ({ eventId, roundId }) => {
  const dispatch = useDispatch()

  const {
    isLoading,
    discipline,
    number,
    event: { name: eventName }
  } = useSelector(state => state.eventRound)

  useEffect(() => {
    dispatch(loadRoundMap(eventId, roundId, { preselectGroup: true }))
  }, [eventId, roundId, dispatch])

  const headerText =
    discipline && number && `// ${I18n.t('disciplines.' + discipline)} - ${number}`

  return (
    <Container>
      <Header>
        <BackLink to={`/events/${eventId}`}>{eventName}</BackLink>
        {headerText}
      </Header>
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

const MainArea = styled.div`
  display: flex;
  flex-basis: 0;
  flex-grow: 1;
  flex-shrink: 1;
  height: 100%;
`

RoundMap.propTypes = {
  eventId: PropTypes.number.isRequired,
  roundId: PropTypes.number.isRequired
}

export default RoundMap
