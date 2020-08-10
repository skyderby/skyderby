import * as Yup from 'yup'

export default loggedIn =>
  Yup.object().shape({
    ...(loggedIn ? {} : { name: Yup.string().required('Name field is required') }),
    suitId: Yup.number().when('suitInputMode', {
      is: 'select',
      then: Yup.number().nullable().required('Suit field is required'),
      otherwise: Yup.number().nullable()
    }),
    missingSuitName: Yup.string().when('suitInputMode', {
      is: 'input',
      then: Yup.string().required('Suit field is required'),
      otherwise: Yup.string().nullable()
    }),
    location: Yup.string().required('Location field is required'),
    trackFileId: Yup.number().required('This field is required'),
    segment: Yup.number()
  })
