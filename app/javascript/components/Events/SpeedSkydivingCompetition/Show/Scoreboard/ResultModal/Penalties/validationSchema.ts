import * as Yup from 'yup'

const validationSchema = Yup.object().shape({
  penalties: Yup.array().of(
    Yup.object().shape({
      percent: Yup.number()
        .nullable()
        .required('This field is required')
        .min(0, 'Min is 0')
        .max(100, 'Max is 100'),
      reason: Yup.string().nullable().required('This field is required')
    })
  )
})

export default validationSchema
