import React from 'react'

import { useI18n } from 'components/TranslationsProvider'
import RoundCell from './RoundCell'
import {
  SpeedSkydivingCompetition,
  Round as RoundType
} from 'api/speedSkydivingCompetitions/types'

type TableHeaderProps = {
  event: SpeedSkydivingCompetition
  rounds: RoundType[]
}

const TableHeader = ({ event, rounds }: TableHeaderProps): JSX.Element => {
  const { t } = useI18n()

  return (
    <thead>
      <tr>
        <th>#</th>
        <th colSpan={2}>Competitor</th>
        {rounds.map(round => (
          <RoundCell key={round.id} event={event} round={round} />
        ))}
        <th>{t('events.show.total')}</th>
        <th>Avg</th>
      </tr>
    </thead>
  )
}

export default TableHeader
