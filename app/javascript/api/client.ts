import axios from 'axios'
export type { AxiosError, AxiosResponse } from 'axios'
import { getCSRFToken, setCSRFToken } from 'utils/csrfToken'

const axiosInstance = axios.create()
axiosInstance.defaults.headers.common['Accept'] = 'application/json'
axiosInstance.defaults.headers.common['Content-Type'] = 'application/json'
axiosInstance.defaults.timeout = 30000

axiosInstance.interceptors.request.use(config => {
  if (!config.headers) config.headers = {}

  if (config.method?.toUpperCase() !== 'GET') {
    config.headers['X-CSRF-Token'] = getCSRFToken()
  }

  if (document.documentElement.lang) {
    config.headers['Accept-Language'] = document.documentElement.lang
  }

  return config
})

axiosInstance.interceptors.response.use(config => {
  if (config.headers?.['new-csrf-token']) {
    setCSRFToken(config.headers['new-csrf-token'])
  }

  return config
})

const isClientError = axios.isAxiosError

export default Object.assign(axiosInstance, { isClientError })
