import React from 'react'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import Round from './Round'

const Index = ({ event, rounds }) => {
  const { t } = useI18n()

  return (
    <thead>
      <tr>
        <th>#</th>
        <th colSpan={2}>Competitor</th>
        {rounds.map(round => (
          <Round key={round.id} event={event} round={round} />
        ))}
        <th>{t('events.show.total')}</th>
        <th>Avg</th>
      </tr>
    </thead>
  )
}

Index.propTypes = {
  rounds: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      number: PropTypes.number.isRequired
    })
  ).isRequired,
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    permissions: PropTypes.shape({
      canEdit: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired
}

export default Index
