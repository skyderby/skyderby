import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { selectGroup } from 'redux/events/round'
import { selectSelectedResults } from 'redux/events/round/selectors'
import { useI18n } from 'components/TranslationsProvider'
import ChevronLeftIcon from 'icons/chevron-left'
import PlayIcon from 'icons/play'
import StopIcon from 'icons/stop'
import Player from './Player'
import GroupSelect from './GroupSelect'
import shuffle from 'utils/shuffle'

import styles from './styles.module.scss'

const buildGroups = (groupedResultIds, results) => {
  const getNames = group => group.map(result => result.name).join(' - ')
  const getIds = group => group.map(result => result.id)

  const topResults = Array.from(results)
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

const RoundReplay = ({
  eventId,
  eventName,
  rangeFrom,
  rangeTo,
  discipline,
  number,
  results,
  groupedResultIds
}) => {
  const { t } = useI18n()
  const dispatch = useDispatch()

  const selectedResults = useSelector(selectSelectedResults)

  const [playing, setPlaying] = useState(false)

  const handleTriggerPlay = () => setPlaying(!playing)

  const handleGroupChange = ({ value }) => dispatch(selectGroup(value))

  const groups = useMemo(() => buildGroups(groupedResultIds, results), [
    groupedResultIds,
    results
  ])

  const headerText =
    discipline && number && `// ${t('disciplines.' + discipline)} - ${number}`

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to={`/events/${eventId}`} className={styles.backLink}>
          <ChevronLeftIcon />
          &nbsp;
          {eventName}
        </Link>
        {headerText}
      </div>

      <div className={styles.playerControls}>
        <GroupSelect options={groups} onChange={handleGroupChange} />
        <button className={styles.playButton} onClick={handleTriggerPlay}>
          {playing ? <StopIcon /> : <PlayIcon />}
        </button>
      </div>

      <Player
        discipline={discipline}
        rangeFrom={rangeFrom}
        rangeTo={rangeTo}
        group={selectedResults}
        playing={playing}
      />
    </div>
  )
}

RoundReplay.propTypes = {
  eventId: PropTypes.number.isRequired,
  eventName: PropTypes.string.isRequired,
  rangeFrom: PropTypes.number.isRequired,
  rangeTo: PropTypes.number.isRequired,
  discipline: PropTypes.oneOf(['distance', 'speed', 'time']),
  number: PropTypes.number.isRequired,
  results: PropTypes.array.isRequired,
  groupedResultIds: PropTypes.array.isRequired
}

export default RoundReplay
