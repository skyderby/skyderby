import React from 'react'
import { Formik, Field, ErrorMessage, FieldProps } from 'formik'
import { Link } from 'react-router-dom'

import {
  SpeedSkydivingCompetitionMutation,
  EventVariables
} from 'api/speedSkydivingCompetitions'
import { eventVisibilities } from 'api/events'
import ErrorText from 'components/ui/ErrorMessage'
import { useI18n } from 'components/TranslationsProvider'
import PlaceSelect from 'components/PlaceSelect'
import RadioButtonGroup from 'components/ui/RadioButtonGroup'
import validationSchema from './validationSchema'
import styles from './styles.module.scss'
import { ValueType } from 'react-select'

type FormProps = {
  initialValues: EventVariables
  mutation: SpeedSkydivingCompetitionMutation
  returnUrl: string
}

const Form = ({ initialValues, mutation, returnUrl }: FormProps): JSX.Element => {
  const { t } = useI18n()

  const handleSubmit = (values: EventVariables) => mutation.mutate(values)

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <div className={styles.formFields}>
            <label>{t('activerecord.attributes.event.name')}</label>
            <div>
              <Field name="name" className={styles.input} />
              <ErrorMessage name="name" component={ErrorText} />
            </div>

            <label>{t('activerecord.attributes.event.starts_at')}</label>
            <div>
              <Field type="date" name="startsAt" className={styles.input} />
              <ErrorMessage name="startsAt" component={ErrorText} />
            </div>

            <label>{t('activerecord.attributes.event.place')}</label>
            <div>
              <Field name="placeId">
                {({ field: { name, ...props }, form: { setFieldValue } }: FieldProps) => (
                  <PlaceSelect
                    {...props}
                    aria-label="Select place"
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
              <ErrorMessage name="placeId" component={ErrorText} />
            </div>

            <label>{t('activerecord.attributes.event.visibility')}</label>
            <Field
              as={RadioButtonGroup}
              name="visibility"
              options={eventVisibilities.map(visibility => ({
                value: visibility,
                label: t(`activerecord.attributes.event.visibilities.${visibility}`)
              }))}
            />

            <label>{t('activerecord.attributes.event.use_teams')}</label>
            <Field
              as={RadioButtonGroup}
              name="useTeams"
              options={[
                { value: 'false', label: t('general.disabled') },
                { value: 'true', label: t('general.enabled') }
              ]}
            />
          </div>

          <div className={styles.footer}>
            <button type="submit" className={styles.primaryButton}>
              {t('general.save')}
            </button>
            <Link to={returnUrl} className={styles.secondaryButton}>
              {t('general.cancel')}
            </Link>
          </div>
        </form>
      )}
    </Formik>
  )
}

export default Form
