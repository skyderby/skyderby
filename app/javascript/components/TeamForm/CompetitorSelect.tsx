import React from 'react'
import Select, { Props } from 'react-select'
import { UseQueryResult } from '@tanstack/react-query'

import { useProfileQueries } from 'api/profiles'
import getSelectStyles from 'styles/selectStyles'

type CompetitorSelectProps<TCompetitor> = Omit<Props, 'value'> & {
  eventId: number
  competitorsQuery: (eventId: number) => UseQueryResult<TCompetitor[]>
  value?: number | null
}

const CompetitorSelect = <TCompetitor extends { profileId: number; id: number }>({
  eventId,
  competitorsQuery: useCompetitorsQuery,
  value,
  ...props
}: CompetitorSelectProps<TCompetitor>): JSX.Element => {
  console.log(useCompetitorsQuery)
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
