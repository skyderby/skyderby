import React, { useState } from 'react'

import { useSignUpMutation } from 'api/users'
import PageWrapper from 'components/Users/PageWrapper'
import SuccessRegistration from './SuccessRegistration'
import Form from './Form'

const SignUp = (): JSX.Element => {
  const [signedUp, setSignedUp] = useState(false)
  const mutation = useSignUpMutation({
    onSuccess: () => setSignedUp(true)
  })

  return (
    <PageWrapper>
      {signedUp ? <SuccessRegistration /> : <Form mutation={mutation} />}
    </PageWrapper>
  )
}

export default SignUp
