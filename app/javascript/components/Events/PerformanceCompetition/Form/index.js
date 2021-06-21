import React from 'react'
import { Link } from 'react-router-dom'
import { Formik, Field, ErrorMessage } from 'formik'
import PropTypes from 'prop-types'

import RadioButtonGroup from 'components/ui/RadioButtonGroup'
import PlaceSelect from 'components/PlaceSelect'
import { useI18n } from 'components/TranslationsProvider'
import ErrorText from 'components/ui/ErrorMessage'
import validationSchema from './validationSchema'
import styles from './styles.module.scss'

const Form = props => {
  const { t } = useI18n()

  return (
    <Formik {...props} validationSchema={validationSchema}>
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

            <label>{t('events.show.comp_window')}</label>
            <div className={styles.competitionWindow}>
              <Field type="number" name="rangeFrom" min="0" className={styles.input} />
              <span>&mdash;</span>
              <Field type="number" name="rangeTo" min="0" className={styles.input} />
            </div>

            <label>{t('activerecord.attributes.event.place')}</label>
            <div>
              <Field name="placeId">
                {({ field: { name, ...props }, form: { setFieldValue } }) => (
                  <PlaceSelect
                    {...props}
                    aria-label="Select place"
                    onChange={({ value }) => setFieldValue(name, value)}
                  />
                )}
              </Field>
              <ErrorMessage name="placeId" component={ErrorText} />
            </div>

            <label>{t('activerecord.attributes.event.visibility')}</label>
            <Field
              as={RadioButtonGroup}
              name="visibility"
              options={[
                {
                  value: 'public_event',
                  label: t('activerecord.attributes.event.visibilities.public_event')
                },
                {
                  value: 'unlisted_event',
                  label: t('activerecord.attributes.event.visibilities.unlisted_event')
                },
                {
                  value: 'private_event',
                  label: t('activerecord.attributes.event.visibilities.private_event')
                }
              ]}
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
            <Link to="/events/new" className={styles.secondaryButton}>
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
    startsAt: PropTypes.string.isRequired,
    useTeams: PropTypes.oneOf(['true', 'false']).isRequired,
    visibility: PropTypes.oneOf(['private_event', 'unlisted_event', 'public_event'])
      .isRequired
  })
}
export default Form
