import * as Yup from 'yup'

export default Yup.object().shape({
  email: Yup.string().required('Email is required').email('Email should be valid'),
  password: Yup.string().required('Password is required')
})
