import React from 'react'
import login from 'api/login'
import Form from './Form'

interface FormValues {
  email: string
  password: string
  rememberMe: boolean
}

const SignIn = (): JSX.Element => {
  const t = txt => txt

  // TODO: redirect to the page the user was on before signing in
  const returnTo = '/'

  return <Form onSubmit={login} />
}

export default SignIn
