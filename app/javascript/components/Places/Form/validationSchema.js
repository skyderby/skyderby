import * as Yup from 'yup'

const schema = Yup.object().shape({
  name: Yup.string().required('This field is required'),
  countryId: Yup.number().nullable().required('This field is required'),
  latitude: Yup.number().nullable().required('This field is required'),
  longitude: Yup.number().nullable().required('This field is required'),
  msl: Yup.number().nullable().required('This field is required'),
  kind: Yup.string().nullable().required('This field is required')
})

export default schema
