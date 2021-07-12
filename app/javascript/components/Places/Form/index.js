import React from 'react'
import { Formik, Field, ErrorMessage } from 'formik'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import ErrorText from 'components/ui/ErrorMessage'
import { useI18n } from 'components/TranslationsProvider'
import CountrySelect from 'components/CountrySelect'
import RadioButtonGroup from 'components/ui/RadioButtonGroup'
import validationSchema from './validationSchema'
import styles from './styles.module.scss'

const Form = props => {
  const { t } = useI18n()

  return (
    <Formik {...props} validationSchema={validationSchema}>
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <div className={styles.formFields}>
            <label>{t('activerecord.attributes.place.name')}</label>
            <div>
              <Field name="name" className={styles.input} />
              <ErrorMessage name="name" component={ErrorText} />
            </div>

            <label>{t('activerecord.attributes.place.kind')}</label>
            <Field
              as={RadioButtonGroup}
              name="kind"
              options={[
                {
                  value: 'skydive',
                  label: t('activerecord.attributes.place.kinds.skydive')
                },
                {
                  value: 'base',
                  label: t('activerecord.attributes.place.kinds.base')
                }
              ]}
            />

            <label>{t('activerecord.attributes.place.country')}</label>
            <div>
              <Field name="countryId">
                {({ field: { name, ...props }, form: { setFieldValue } }) => (
                  <CountrySelect
                    {...props}
                    placeholder={t('views.places.placeholder')}
                    aria-label="Select country"
                    onChange={({ value }) => setFieldValue(name, value)}
                  />
                )}
              </Field>
              <ErrorMessage name="countryId" component={ErrorText} />
            </div>

            <label>{t('activerecord.attributes.place.latitude')}</label>
            <div>
              <Field name="latitude" className={styles.input} />
              <ErrorMessage name="latitude" component={ErrorText} />
            </div>

            <label>{t('activerecord.attributes.place.longitude')}</label>
            <div>
              <Field name="longitude" className={styles.input} />
              <ErrorMessage name="longitude" component={ErrorText} />
            </div>

            <label>{t('activerecord.attributes.place.msl')}</label>
            <div>
              <Field name="msl" className={styles.input} />
              <ErrorMessage name="msl" component={ErrorText} />
            </div>
          </div>

          <div className={styles.footer}>
            <button type="submit" className={styles.primaryButton}>
              {t('general.save')}
            </button>
            <Link to="/places" className={styles.secondaryButton}>
              {t('general.cancel')}
            </Link>
          </div>
        </form>
      )}
    </Formik>
  )
}

Form.propTypes = {
  initialValues: PropTypes.shape({
    name: PropTypes.string.isRequired,
    kind: PropTypes.oneOf(['skydive', 'base']).isRequired,
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    msl: PropTypes.number.isRequired
  })
}

export default Form
