import React from 'react'
import { Field } from 'formik'

import { useI18n } from 'components/TranslationsProvider'

import PlaceSelect from './PlaceSelect'
import styles from './styles.module.scss'

const TrackLocationField = () => {
  const { t } = useI18n()

  return (
    <div className={styles.inputContainer}>
      <Field name="placeId">
        {({
          field: { name, ...props },
          form: { values, setFieldValue },
          meta: { touched, error }
        }) => (
          <>
            <PlaceSelect
              hide={values.formSupportData.placeInputMode === 'input'}
              isInvalid={touched && error}
              {...props}
              onChange={value => setFieldValue(name, value)}
            />
            {touched && error && <div className={styles.errorMessage}>{error}</div>}
          </>
        )}
      </Field>

      <Field name="location">
        {({ field, form: { values }, meta: { touched, error } }) => (
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
        {({ field: { value, name }, form: { setFieldValue } }) => (
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
