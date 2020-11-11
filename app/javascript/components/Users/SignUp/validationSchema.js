import * as Yup from 'yup'

export default Yup.object().shape({
  email: Yup.string().required('Email is required').email('Email should be valid'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password should be at least 6 characters'),
  passwordConfirmation: Yup.string().oneOf(
    [Yup.ref('password'), null],
    'Passwords must match'
  )
})
