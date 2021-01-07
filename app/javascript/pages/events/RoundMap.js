import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import usePageStatus from 'hooks/usePageStatus'
import { loadRoundMap } from 'redux/events/round'
import AppShell from 'components/AppShell'
import PageWrapper from 'components/PageWrapper'
import RoundMap from 'components/RoundMap'

const EventRoundMap = ({ match }) => {
  const eventId = Number(match.params.id)
  const roundId = Number(match.params.roundId)

  const dispatch = useDispatch()
  const [status, { onLoadStart, onLoadSuccess, onError }] = usePageStatus({
    linkBack: `/events/${eventId}`
  })

  const {
    discipline,
    number,
    event: { name: eventName }
  } = useSelector(state => state.eventRound)

  useEffect(() => {
    onLoadStart()
    dispatch(loadRoundMap(eventId, roundId, { preselectGroup: true }))
      .then(onLoadSuccess)
      .catch(onError)
  }, [dispatch, eventId, roundId, onLoadStart, onLoadSuccess, onError])

  return (
    <AppShell fullScreen>
      <PageWrapper {...status}>
        <RoundMap
          discipline={discipline}
          number={number}
          eventId={eventId}
          eventName={eventName}
        />
      </PageWrapper>
    </AppShell>
  )
}

EventRoundMap.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
      roundId: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default EventRoundMap
