import * as Yup from 'yup'

import { I18n } from 'components/TranslationsProvider'

const validationSchema = Yup.object().shape({
  name: Yup.string().required(() =>
    I18n.t('activerecord.errors.models.event/section.attributes.name.blank')
  )
})

export default validationSchema
