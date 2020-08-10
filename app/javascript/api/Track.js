import axios from 'axios'
import { isMobileOnly } from 'react-device-detect'

const endpoint = '/api/v1/tracks'

const prefixKey = (key, prefix) => (prefix ? `${prefix}[${key}]` : key)
const allowedFilters = ['profileId', 'suitId', 'placeId', 'year']

export const IndexParams = {
  mapToUrl: ({ activity, filters, page }, prefix) => {
    const params = new URLSearchParams()

    if (activity) params.set(prefixKey('kind', prefix), activity)
    if (Number(page) > 1) params.set(prefixKey('page', prefix), page)

    filters.forEach(([key, val]) => params.append(`${prefixKey(key, prefix)}[]`, val))

    return params.toString() === '' ? '' : '?' + params.toString()
  },

  extractFromUrl: (urlSearch, prefix) => {
    const allParams = new URLSearchParams(urlSearch)

    const activity = allParams.get(prefixKey('kind', prefix))
    const page = allParams.get(prefixKey('page', prefix)) || 1

    const filters = Array.from(allParams.entries())
      .map(([key, val]) => {
        const filterKey = allowedFilters.find(filter => {
          const singularKey = prefixKey(filter, prefix)
          const pluralKey = `${singularKey}[]`

          return [singularKey, pluralKey].includes(key)
        })

        return [filterKey, val]
      })
      .filter(([key, _val]) => key)

    const perPage = isMobileOnly ? 5 : 25

    return { activity, filters, page, perPage }
  }
}

const Track = {
  findRecord: async id => {
    const { data } = await axios.get(`${endpoint}/${id}`)

    return data
  },

  findAll: async params => {
    const dataUrl = [endpoint, IndexParams.mapToUrl(params)].join('')

    const { data } = await axios.get(dataUrl)

    return data
  },

  createRecord: async ({ segment, ...params }) => {
    const { data } = await axios.post(endpoint, { track: params, segment })

    return data
  }
}

export default Track
