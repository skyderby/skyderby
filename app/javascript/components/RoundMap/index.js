import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { loadRoundMap } from 'redux/events/roundMap'
import Container from 'components/ui/FullscreenContainer'
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
  } = useSelector(state => state.eventRoundMap)

  useEffect(() => {
    dispatch(loadRoundMap(eventId, roundId))
  }, [eventId, roundId, dispatch])

  const headerText =
    discipline && number && `// ${I18n.t('disciplines.' + discipline)} - ${number}`

  return (
    <Container>
      <Header>
        <BackLink href={`/events/${eventId}`}>{eventName}</BackLink>
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

const Header = styled.div`
  color: #999;
  font-family: 'Proxima Nova Semibold';
  font-size: 24px;
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

RoundMap.propTypes = {
  eventId: PropTypes.string.isRequired,
  roundId: PropTypes.string.isRequired
}

export default RoundMap
