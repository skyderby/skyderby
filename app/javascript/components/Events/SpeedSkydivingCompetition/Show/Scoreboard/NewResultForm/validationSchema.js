import * as Yup from 'yup'

const validationSchema = Yup.object().shape({
  trackId: Yup.number()
    .nullable()
    .when('trackFrom', {
      is: 'existent',
      then: Yup.number().nullable().required('This field is required'),
      otherwise: Yup.number().nullable()
    }),
  trackFile: Yup.mixed()
    .nullable()
    .when('trackFrom', {
      is: 'from_file',
      then: Yup.mixed().nullable().required('This field is required'),
      otherwise: Yup.mixed().nullable()
    })
})

export default validationSchema
