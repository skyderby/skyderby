import * as Yup from 'yup'

export default Yup.object().shape({
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password should be at least 6 characters'),
  passwordConfirmation: Yup.string().oneOf(
    [Yup.ref('password'), null],
    'Passwords must match'
  )
})
