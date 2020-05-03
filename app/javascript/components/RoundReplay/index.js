import React, { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'

import { loadRoundMap, selectGroup } from 'redux/events/round'
import { selectSelectedResults } from 'redux/events/round/selectors'
import { Container, Header } from 'components/ui/FullscreenContainer'
import BackLink from 'components/ui/BackLink'
import Player from './Player'
import GroupSelect from './GroupSelect'
import { PlayerControls, PlayButton } from './elements'
import shuffle from 'utils/shuffle'

const buildGroups = (groupedResultIds, results) => {
  const getNames = group => group.map(result => result.name).join(' - ')
  const getIds = group => group.map(result => result.id)

  const topResults = results
    .sort((a, b) => b.result - a.result)
    .filter((_val, idx) => idx < 4)

  const groups = groupedResultIds.map(group =>
    group.map(id => results.find(result => result.id === id))
  )

  return [
    { label: `Top 4 - ${getNames(topResults)}`, value: getIds(shuffle(topResults)) },
    ...groups.map((group, idx) => ({
      label: `${idx + 1} - ${getNames(group)}`,
      value: getIds(shuffle(group))
    }))
  ]
}

const RoundReplay = ({ eventId, roundId }) => {
  const dispatch = useDispatch()

  const {
    isLoading,
    discipline,
    number,
    results,
    groups: groupedResultIds,
    event: { name: eventName, rangeFrom, rangeTo }
  } = useSelector(state => state.eventRound)

  const selectedResults = useSelector(selectSelectedResults)

  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    dispatch(loadRoundMap(eventId, roundId, { preselecteGroup: false }))
  }, [eventId, roundId, dispatch])

  const handleTriggerPlay = () => setPlaying(!playing)

  const handleGroupChange = ({ value }) => dispatch(selectGroup(value))

  const groups = useMemo(() => buildGroups(groupedResultIds, results), [
    groupedResultIds,
    results
  ])

  const headerText =
    discipline && number && `// ${I18n.t('disciplines.' + discipline)} - ${number}`

  return (
    <Container>
      <Header>
        <BackLink to={`/events/${eventId}`}>{eventName}</BackLink>
        {headerText}
      </Header>

      <PlayerControls>
        <GroupSelect options={groups} onChange={handleGroupChange} />
        <PlayButton onClick={handleTriggerPlay}>
          {playing ? <i className="fas fa-stop" /> : <i className="fas fa-play" />}
        </PlayButton>
      </PlayerControls>

      {isLoading ? (
        <h1>Loading...</h1>
      ) : (
        <Player
          discipline={discipline}
          rangeFrom={rangeFrom}
          rangeTo={rangeTo}
          group={selectedResults}
          playing={playing}
        />
      )}
    </Container>
  )
}

RoundReplay.propTypes = {
  eventId: PropTypes.number.isRequired,
  roundId: PropTypes.number.isRequired
}

export default RoundReplay
