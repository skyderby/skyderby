import * as Yup from 'yup'

import { I18n } from 'components/TranslationsProvider'

const validationSchema = Yup.object().shape({
  categoryId: Yup.number()
    .nullable()
    .required(() =>
      I18n.t('activerecord.errors.models.event/competitor.attributes.section.blank')
    ),
  suitId: Yup.number()
    .nullable()
    .required(() =>
      I18n.t('activerecord.errors.models.event/competitor.attributes.suit.blank')
    ),
  profileId: Yup.number().when('newProfile', {
    is: 'false',
    then: Yup.number()
      .nullable()
      .required(() =>
        I18n.t('activerecord.errors.models.event/competitor.attributes.profile.blank')
      ),
    otherwise: Yup.number().nullable()
  }),
  profileAttributes: Yup.object().when('newProfile', {
    is: 'true',
    then: Yup.object().shape({
      name: Yup.string().required('This field is required'),
      countryId: Yup.number().nullable().required('This field is required')
    }),
    otherwise: Yup.object().nullable()
  })
})

export default validationSchema
