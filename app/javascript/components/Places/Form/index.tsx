import React from 'react'
import { Formik, Field, ErrorMessage, FieldProps } from 'formik'
import { Link } from 'react-router-dom'

import ErrorText from 'components/ui/ErrorMessage'
import { useI18n } from 'components/TranslationsProvider'
import CountrySelect from 'components/CountrySelect'
import RadioButtonGroup from 'components/ui/RadioButtonGroup'
import validationSchema from './validationSchema'
import styles from './styles.module.scss'
import { CreateVariables, NewPlaceMutation } from 'api/places'
import { ValueType } from 'react-select'

type FormProps = {
  initialValues: CreateVariables
  mutation: NewPlaceMutation
}

const Form = ({ initialValues, mutation }: FormProps): JSX.Element => {
  const { t } = useI18n()

  const handleSubmit = (values: CreateVariables) => mutation.mutate(values)

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
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
                {({
                  field: { name, ...props },
                  form: { setFieldValue }
                }: FieldProps): JSX.Element => (
                  <CountrySelect
                    {...props}
                    placeholder={t('views.places.placeholder')}
                    aria-label="Select country"
                    onChange={(option: ValueType<{ value: number }, false>) => {
                      if (option === null) {
                        setFieldValue(name, null)
                      } else {
                        setFieldValue(name, option.value)
                      }
                    }}
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

export default Form
