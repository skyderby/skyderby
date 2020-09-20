import React from 'react'
import { Field } from 'formik'

import { useI18n } from 'components/TranslationsProvider'
import FlatButton from 'components/ui/FlatButton'
import Input from 'components/ui/Input'

import SuitSelect from './SuitSelect'
import { InputContainer, InputModeToggle, ErrorMessage } from './elements'

const TrackSuitField = () => {
  const { t } = useI18n()

  return (
    <InputContainer>
      <Field name="suitId">
        {({
          field: { name, ...props },
          form: { values, setFieldValue },
          meta: { touched, error }
        }) => (
          <>
            <SuitSelect
              hide={values.formSupportData.suitInputMode === 'input'}
              isInvalid={touched && error}
              {...props}
              onChange={value => setFieldValue(name, value)}
            />
            {touched && error && <ErrorMessage>{error}</ErrorMessage>}
          </>
        )}
      </Field>

      <Field name="missingSuitName">
        {({ field, form: { values }, meta: { touched, error } }) => (
          <>
            <Input
              hide={values.formSupportData.suitInputMode === 'select'}
              isInvalid={touched && error}
              placeholder={t('tracks.form.suit_text_placeholder')}
              {...field}
            />

            {touched && error && <ErrorMessage>{error}</ErrorMessage>}
          </>
        )}
      </Field>

      <Field name="formSupportData.suitInputMode">
        {({ field: { value, name }, form: { setFieldValue } }) => (
          <InputModeToggle>
            <span>
              {value === 'select'
                ? t('tracks.form.toggle_suit_caption')
                : t('tracks.form.toggle_suit_caption_select')}
            </span>
            <FlatButton
              as="span"
              onClick={() => setFieldValue(name, value === 'select' ? 'input' : 'select')}
            >
              {value === 'select'
                ? t('tracks.form.toggle_suit_link')
                : t('tracks.form.toggle_suit_link_select')}
            </FlatButton>
          </InputModeToggle>
        )}
      </Field>
    </InputContainer>
  )
}

export default TrackSuitField
