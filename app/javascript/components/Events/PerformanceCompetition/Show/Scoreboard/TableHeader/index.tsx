import React from 'react'

import { useI18n } from 'components/TranslationsProvider'
import { PerformanceCompetition, Round } from 'api/performanceCompetitions'
import RoundCell from './RoundCell'

const taskUnits = {
  distance: 'm',
  speed: 'kmh',
  time: 'sec'
}

type TableHeaderProps = {
  event: PerformanceCompetition
  roundsByTask: [Round['task'], Round[]][]
}

const TableHeader = ({ event, roundsByTask }: TableHeaderProps) => {
  const { t } = useI18n()

  return (
    <thead>
      <tr>
        <th rowSpan={3}>#</th>
        <th rowSpan={3} colSpan={2}>
          Competitor
        </th>
        {roundsByTask.map(([task, rounds]) => (
          <th key={task} colSpan={rounds.length * 2 + 1}>
            {t(`disciplines.${task}`)}
          </th>
        ))}
        <th rowSpan={3}>{t('events.show.total')}</th>
      </tr>
      <tr>
        {roundsByTask.map(([task, rounds]) => (
          <React.Fragment key={task}>
            {rounds.map(round => (
              <RoundCell key={round.slug} event={event} round={round} />
            ))}
            <th rowSpan={2}>%</th>
          </React.Fragment>
        ))}
      </tr>
      <tr>
        {roundsByTask.map(([task, rounds]) =>
          rounds.map(round => (
            <React.Fragment key={round.slug}>
              <th>{t(`units.${taskUnits[task]}`)}</th>
              <th>%</th>
            </React.Fragment>
          ))
        )}
      </tr>
    </thead>
  )
}

export default TableHeader
