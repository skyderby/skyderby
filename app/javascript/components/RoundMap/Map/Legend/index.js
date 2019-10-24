import React from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'

import LegendItem from './LegendItem'
import {
  afterExitColor,
  windowStartColor,
  windowEndColor
} from 'components/RoundMap/constants'

const Legend = () => {
  const { rangeFrom, rangeTo } = useSelector(state => state.eventRoundMap.event)

  return (
    <List>
      <LegendItem color={afterExitColor}>
        {I18n.t('events.rounds.map.after_exit_description')}
      </LegendItem>
      <LegendItem color={windowStartColor}>
        {I18n.t('events.rounds.map.start_window_description', { altitude: rangeFrom })}
      </LegendItem>
      <LegendItem color={windowEndColor}>
        {I18n.t('events.rounds.map.end_window_description', { altitude: rangeTo })}
      </LegendItem>
    </List>
  )
}

const List = styled.div`
  flex-grow: 0;
`

export default Legend
