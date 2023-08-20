import * as Yup from 'yup'

const validationSchema = Yup.object<Record<string, Yup.AnySchema>>().shape({
  sourceEventId: Yup.string().nullable().required('This field is required.')
})

export default validationSchema
