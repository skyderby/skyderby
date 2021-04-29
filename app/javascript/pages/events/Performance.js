import React from 'react'
import PropTypes from 'prop-types'

import AppShell from 'components/AppShell'
import PageWrapper from 'components/PageWrapper'
import PerformanceCompetitionScoreboard from 'components/PerformanceCompetitionScoreboard'
import PerformanceCompetitionHeader from 'components/PerformanceCompetitionHeader'
import { usePerformanceEventQuery } from 'api/hooks/performanceCompetitions'

const PerformancePage = ({ match }) => {
  const eventId = Number(match.params.id)

  const { data: event, status, error } = usePerformanceEventQuery(eventId)

  return (
    <AppShell>
      <PageWrapper status={status} error={error}>
        <div>
          <PerformanceCompetitionHeader event={event} />

          <PerformanceCompetitionScoreboard eventId={eventId} />
        </div>
      </PageWrapper>
    </AppShell>
  )
}

PerformancePage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default PerformancePage
