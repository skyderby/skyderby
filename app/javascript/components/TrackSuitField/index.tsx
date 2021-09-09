import React from 'react'
import { Field, FieldProps } from 'formik'

import { useI18n } from 'components/TranslationsProvider'
import SuitSelect from 'components/SuitSelect'
import styles from './styles.module.scss'

const TrackSuitField = (): JSX.Element => {
  const { t } = useI18n()

  return (
    <div className={styles.inputContainer}>
      <Field name="suitId">
        {({
          field: { name, ...props },
          form: { values, setFieldValue },
          meta: { touched, error }
        }: FieldProps) => (
          <>
            <SuitSelect
              hide={values.formSupportData.suitInputMode === 'input'}
              isInvalid={touched && error}
              placeholder={t('tracks.form.suit_select_placeholder')}
              aria-label={t('tracks.form.suit_select_placeholder')}
              {...props}
              onChange={option => {
                if (option === null) {
                  setFieldValue(name, option)
                } else if ('value' in option) {
                  setFieldValue(name, option?.value)
                }
              }}
            />
            {touched && error && <div className={styles.errorMessage}>{error}</div>}
          </>
        )}
      </Field>

      <Field name="missingSuitName">
        {({ field, form: { values }, meta: { touched, error } }: FieldProps) => (
          <>
            <input
              className={styles.input}
              data-hide={values.formSupportData.suitInputMode === 'select'}
              data-invalid={touched && error}
              placeholder={t('tracks.form.suit_text_placeholder')}
              {...field}
            />

            {touched && error && <div className={styles.errorMessage}>{error}</div>}
          </>
        )}
      </Field>

      <Field name="formSupportData.suitInputMode">
        {({ field: { value, name }, form: { setFieldValue } }: FieldProps) => (
          <div className={styles.inputModeToggle}>
            <span>
              {value === 'select'
                ? t('tracks.form.toggle_suit_caption')
                : t('tracks.form.toggle_suit_caption_select')}
            </span>
            <span
              className={styles.flatButton}
              onClick={() => setFieldValue(name, value === 'select' ? 'input' : 'select')}
            >
              {value === 'select'
                ? t('tracks.form.toggle_suit_link')
                : t('tracks.form.toggle_suit_link_select')}
            </span>
          </div>
        )}
      </Field>
    </div>
  )
}

export default TrackSuitField
