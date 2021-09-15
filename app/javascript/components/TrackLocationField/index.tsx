import React from 'react'
import { Field, FieldProps } from 'formik'

import { useI18n } from 'components/TranslationsProvider'
import PlaceSelect, { OptionType } from 'components/PlaceSelect'
import styles from './styles.module.scss'

const TrackLocationField = (): JSX.Element => {
  const { t } = useI18n()

  return (
    <div className={styles.inputContainer}>
      <Field name="placeId">
        {({
          field: { name, ...props },
          form: { values, setFieldValue },
          meta: { touched, error }
        }: FieldProps) => (
          <>
            <PlaceSelect
              hide={values.formSupportData.placeInputMode === 'input'}
              isInvalid={touched && error}
              {...props}
              onChange={(option: OptionType) => {
                if (option === null) {
                  setFieldValue(name, option)
                } else if ('value' in option) {
                  setFieldValue(name, option.value)
                }
              }}
            />
            {touched && error && <div className={styles.errorMessage}>{error}</div>}
          </>
        )}
      </Field>

      <Field name="location">
        {({ field, form: { values }, meta: { touched, error } }: FieldProps) => (
          <>
            <input
              className={styles.input}
              data-hide={values.formSupportData.placeInputMode === 'select'}
              data-invalid={touched && error}
              placeholder={t('tracks.form.place_text_placeholder')}
              {...field}
            />

            {touched && error && <div className={styles.errorMessage}>{error}</div>}
          </>
        )}
      </Field>

      <Field name="formSupportData.placeInputMode">
        {({ field: { value, name }, form: { setFieldValue } }: FieldProps) => (
          <div className={styles.inputModeToggle}>
            <span>
              {value === 'select'
                ? t('tracks.form.toggle_place_caption')
                : t('tracks.form.toggle_place_caption_select')}
            </span>
            <span
              className={styles.flatButton}
              onClick={() => setFieldValue(name, value === 'select' ? 'input' : 'select')}
            >
              {value === 'select'
                ? t('tracks.form.toggle_place_link')
                : t('tracks.form.toggle_place_link_select')}
            </span>
          </div>
        )}
      </Field>
    </div>
  )
}

export default TrackLocationField
