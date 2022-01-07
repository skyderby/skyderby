import React from 'react'
import { AxiosResponse } from 'axios'

import { I18n } from 'components/TranslationsProvider'
import styles from './styles.module.scss'

type RequestErrorToastProps = {
  response?: AxiosResponse<Record<string, string[]>>
}

const RequestErrorToast = ({ response }: RequestErrorToastProps): JSX.Element => {
  const data = response?.data?.errors || {}
  const messages = Object.values(data).flat()
  const errors =
    messages.length > 0
      ? messages
      : ['Request failed' + response?.status ? `with status ${response?.status}` : '']

  return (
    <div>
      {I18n.t('errors.messages.not_saved', { count: errors.length })}
      <ul className={styles.list}>
        {errors.map((error, idx) => (
          <li key={idx}>{String(error)}</li>
        ))}
      </ul>
    </div>
  )
}

export default RequestErrorToast
