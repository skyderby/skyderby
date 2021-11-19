import React, { useState } from 'react'

import { useSignUpMutation } from 'api/users'
import Layout from 'components/Users/Layout'
import SuccessRegistration from './SuccessRegistration'
import Form from './Form'

const SignUp = (): JSX.Element => {
  const [signedUp, setSignedUp] = useState(false)
  const mutation = useSignUpMutation({
    onSuccess: () => setSignedUp(true)
  })

  return (
    <Layout>{signedUp ? <SuccessRegistration /> : <Form mutation={mutation} />}</Layout>
  )
}

export default SignUp
