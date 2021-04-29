import React from 'react'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'

const taskUnits = {
  distance: 'm',
  speed: 'kmh',
  time: 'sec'
}

const TableHeader = ({ roundsByTask }) => {
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
              <th key={round.slug} colSpan={2}>
                {round.number}
              </th>
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
  roundsByTask: PropTypes.arrayOf(PropTypes.array).isRequired
}

export default TableHeader
