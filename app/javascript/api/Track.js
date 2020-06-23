import axios from 'axios'
import { isMobileOnly } from 'react-device-detect'

const endpoint = '/api/v1/tracks'

export const mapParamsToUrl = ({ activity, filters, page }) =>
  '?' +
  [
    ['page', Number(page) > 1 ? page : undefined],
    ['kind', activity],
    ...filters.map(([key, value]) => [`${key}[]`, value])
  ]
    .filter(([_key, val]) => val)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

export const extractParamsFromUrl = urlSearch => {
  const allParams = Array.from(new URLSearchParams(urlSearch))

  const [_activityKey, activity] = allParams.find(([key]) => key === 'kind') || []
  const [_pageKey, page = 1] = allParams.find(([key]) => key === 'page') || []

  const filters = allParams
    .filter(([key]) => !['kind', 'page'].includes(key))
    .map(([key, value]) => [key.replace('[]', ''), value])

  const perPage = isMobileOnly ? 5 : 25

  return { activity, filters, page, perPage }
}

const Track = {
  findRecord: async id => {
    const { data } = await axios.get(`${endpoint}/${id}`)

    return data
  },

  findAll: async params => {
    console.log(params)
    const dataUrl = [endpoint, mapParamsToUrl(params)].join('')

    const { data } = await axios.get(dataUrl)

    return data
  }
}

export default Track
