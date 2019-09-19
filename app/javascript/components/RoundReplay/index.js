import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import Container from 'components/ui/FullscreenContainer'
import shuffle from 'utils/shuffle'
import Player from './Player'

const RoundReplay = ({ eventId, roundId }) => {
  const [playing, setPlaying] = useState(false)
  const [loading, setIsLoading] = useState(true)
  const [roundData, setRoundData] = useState({ groups: [] })
  const [group, setGroup] = useState()

  const handleGroupChange = ({ target: { value: selected } }) => {
    setPlaying(false)

    if (selected === 'Top4') {
      const group = shuffle(
        []
          .concat(...roundData.groups)
          .sort((a, b) => b.result - a.result)
          .filter((_val, idx) => idx < 4)
      )

      setGroup(group)
    } else if (selected) {
      setGroup(roundData.groups[selected])
    } else {
      setGroup(undefined)
    }
  }

  const handleTriggerPlay = () => setPlaying(!playing)

  useEffect(() => {
    const dataUrl = `/api/v1/events/${eventId}/rounds/${roundId}`

    const requestOptions = {
      credentials: 'same-origin',
      Accept: 'application/json'
    }

    fetch(dataUrl, requestOptions)
      .then(response => response.json())
      .then(data => {
        setRoundData(data)
        setIsLoading(false)
      })
  }, [])

  return (
    <Container>
      <Header>
        <BackButton href={`/events/${eventId}`}>
          <i className="fa fa-chevron-left"></i>
        </BackButton>
        <Select onChange={handleGroupChange}>
          <option value="">Select group</option>
          <option value="Top4">Top 4</option>
          {roundData.groups.map((_el, idx) => (
            <option key={idx} value={idx}>{`Group ${idx + 1}`}</option>
          ))}
        </Select>
        <PlayButton onClick={handleTriggerPlay}>
          {playing ? <i className="fas fa-stop" /> : <i className="fas fa-play" />}
        </PlayButton>
      </Header>
      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <Player discipline={roundData.discipline} group={group} playing={playing} />
      )}
    </Container>
  )
}

const BackButton = styled.a`
  color: #555;
  border-radius: 4px;
  font-size: 24px;
  padding: 0px 12px 0px 10px;

  &:hover {
    background-color: #f3f3f3;
    color: #555;
    text-decoration: none;
  }
`

const PlayButton = styled.button`
  border-radius: 4px;
  padding: 6px 10px;
`

const Select = styled.select`
  color: #333;
  background-color: white;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 6px 28px 6px 12px;
  height: 30px;
  min-width: 150px;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 5px;

  > * {
    margin-right: 10px;
  }
`

export default RoundReplay
