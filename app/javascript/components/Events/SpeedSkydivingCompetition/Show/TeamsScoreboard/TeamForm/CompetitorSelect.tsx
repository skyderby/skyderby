import React from 'react'
import Select, { Props } from 'react-select'

import { useCompetitorsQuery } from 'api/speedSkydivingCompetitions'
import { useProfileQueries } from 'api/profiles'
import getSelectStyles from 'styles/selectStyles'

type CompetitorSelectProps = Omit<Props, 'value'> & {
  eventId: number
  value?: number | null
}

const CompetitorSelect = ({
  eventId,
  value,
  ...props
}: CompetitorSelectProps): JSX.Element => {
  const { data: competitors = [] } = useCompetitorsQuery(eventId)
  const profileQueries = useProfileQueries(
    competitors.map(competitor => competitor.profileId)
  )

  const options = competitors.map(competitor => ({
    value: competitor.id,
    label:
      profileQueries.find(
        query => !query.isLoading && query.data?.id === competitor.profileId
      )?.data?.name ?? ''
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

export default CompetitorSelect
