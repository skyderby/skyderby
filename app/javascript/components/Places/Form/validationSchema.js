import * as Yup from 'yup'
import { I18n } from 'components/TranslationsProvider'

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
  msl: Yup.number()
    .nullable()
    .required(() => I18n.t('activerecord.errors.place.msl')),
  kind: Yup.string()
    .nullable()
    .required(() => I18n.t('activerecord.errors.place.kind'))
})
