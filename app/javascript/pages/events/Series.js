import React from 'react'
import PropTypes from 'prop-types'

import AppShell from 'components/AppShell'

const SeriesPage = ({ match }) => {
  const seriesId = Number(match.params.id)

  return (
    <AppShell>
      <h1>Series {seriesId}</h1>
    </AppShell>
  )
}

SeriesPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default SeriesPage
