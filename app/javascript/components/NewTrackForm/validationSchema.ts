import * as Yup from 'yup'

const schema = Yup.object().shape({
  suitId: Yup.number().when('formSupportData.suitInputMode', {
    is: 'select',
    then: Yup.number().nullable().required('Suit field is required'),
    otherwise: Yup.number().nullable()
  }),
  missingSuitName: Yup.string().when('formSupportData.suitInputMode', {
    is: 'input',
    then: Yup.string().required('Suit field is required'),
    otherwise: Yup.string().nullable()
  }),
  location: Yup.string().required('Location field is required'),
  trackFileId: Yup.number().required('This field is required'),
  segment: Yup.number()
})

export default schema
