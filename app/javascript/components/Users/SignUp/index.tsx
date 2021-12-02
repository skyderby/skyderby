import React, { useState } from 'react'

import { useSignUpMutation } from 'api/users'
import SuccessRegistration from './SuccessRegistration'
import Form from './Form'

const SignUp = (): JSX.Element => {
  const [signedUp, setSignedUp] = useState(false)
  const mutation = useSignUpMutation({
    onSuccess: () => setSignedUp(true)
  })

  return signedUp ? <SuccessRegistration /> : <Form mutation={mutation} />
}

export default SignUp
