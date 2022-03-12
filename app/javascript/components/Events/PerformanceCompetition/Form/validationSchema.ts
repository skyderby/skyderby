import * as Yup from 'yup'

const schema = Yup.object().shape({
  name: Yup.string().required('This field is required'),
  startsAt: Yup.date().required('This field is required'),
  placeId: Yup.number().nullable().required('This field is required')
})

export default schema
