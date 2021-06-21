import { useQuery } from 'react-query'

import Api from 'api'

const useCategoriesQuery = eventId => {
  const {
    data: categories = [],
    isLoading
  } = useQuery(`performanceCompetitions/${eventId}/categories`, () =>
    Api.PerformanceCompetitions.Categories.findAll(eventId)
  )
  return { categories, isLoading }
}

export default useCategoriesQuery
