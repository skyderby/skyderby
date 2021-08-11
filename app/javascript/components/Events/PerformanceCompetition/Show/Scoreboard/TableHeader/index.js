import React from 'react'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import Round from './Round'

const taskUnits = {
  distance: 'm',
  speed: 'kmh',
  time: 'sec'
}

const TableHeader = ({ event, roundsByTask }) => {
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
              <Round key={round.slug} event={event} round={round} />
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

TableHeader.propTypes = {
  roundsByTask: PropTypes.arrayOf(PropTypes.array).isRequired,
  event: PropTypes.object.isRequired
}

export default TableHeader
