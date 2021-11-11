import React from 'react'
import Select from 'react-select'
import PropTypes from 'prop-types'

import { useCompetitorsQuery } from 'api/speedSkydivingCompetitions'
import { useProfileQueries } from 'api/profiles'
import getSelectStyles from 'styles/selectStyles'

const CompetitorSelect = ({ eventId, value, ...props }) => {
  const { data: competitors = [] } = useCompetitorsQuery(eventId)
  const profileQueries = useProfileQueries(
    competitors.map(competitor => competitor.profileId)
  )

  const options = competitors.map(competitor => ({
    value: competitor.id,
    label: profileQueries.find(
      query => !query.isLoading && query.data.id === competitor.profileId
    )?.data?.name
  }))
  const selectedOption = options.find(option => option.value === value)

  return (
    <Select
      options={options}
      value={selectedOption}
      {...props}
      styles={getSelectStyles()}
      menuPortalTarget={document.getElementById('dropdowns-root')}
    />
  )
}

CompetitorSelect.propTypes = {
  eventId: PropTypes.number.isRequired,
  value: PropTypes.number
}

export default CompetitorSelect
