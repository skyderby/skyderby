import * as Yup from 'yup'
import { I18n } from 'components/TranslationsProvider'
import { placeTypes } from 'api/places'

export default Yup.object().shape({
  name: Yup.string().required(() => I18n.t('activerecord.errors.place.name')),
  countryId: Yup.number()
    .nullable()
    .required(() => I18n.t('activerecord.errors.place.countryId')),
  latitude: Yup.number()
    .nullable()
    .required(() => I18n.t('activerecord.errors.place.latitude')),
  longitude: Yup.number()
    .nullable()
    .required(() => I18n.t('activerecord.errors.place.longitude')),
  msl: Yup.number().when('kind', {
    is: 'skydive',
    then: Yup.number()
      .nullable()
      .required(() => I18n.t('activerecord.errors.place.msl')),
    otherwise: Yup.number().nullable()
  }),
  kind: Yup.mixed()
    .nullable()
    .oneOf(Array.from(placeTypes), () => I18n.t('activerecord.errors.place.kind'))
})
