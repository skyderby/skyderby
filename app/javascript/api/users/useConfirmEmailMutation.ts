import { useMutation } from 'react-query'
import { AxiosResponse, AxiosError } from 'axios'
import client from 'api/client'

interface Variables {
  confirmationToken: string
}

interface Errors {
  errors: {
    confirmation_token: string[]
    base: string[]
  }
}

const confirmEmail = async (variables: Variables) => {
  const { data } = await client.put<Variables, AxiosResponse>(
    '/api/users/confirmations',
    variables
  )

  return data
}

const useConfirmEmailMutation = () =>
  useMutation<AxiosResponse, AxiosError<Errors>, Variables>(confirmEmail)

export default useConfirmEmailMutation
