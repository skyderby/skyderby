import React from 'react'
import { Formik, Field, ErrorMessage } from 'formik'
import PropTypes from 'prop-types'

import Modal from 'components/ui/Modal'
import { useI18n } from 'components/TranslationsProvider'
import ProfileSelect from 'components/ProfileSelect'
import CountrySelect from 'components/CountrySelect'
import CategorySelect from './CategorySelect'
import validationSchema from './validationSchema'
import styles from './styles.module.scss'

const defaultInitialValues = {
  profileId: null,
  profileAttributes: {
    name: '',
    countryId: null
  },
  categoryId: null,
  assignedNumber: null,
  newProfile: 'false'
}

const CompetitorForm = ({
  eventId,
  initialValues = defaultInitialValues,
  onSubmit: save,
  onHide: hide
}) => {
  const { t } = useI18n()

  const handleSubmit = async (values, formikBag) => {
    const competitorParams = {
      categoryId: values.categoryId,
      assignedNumber: values.assignedNumber,
      ...(values.newProfile === 'true'
        ? {
            profileAttributes: values.profileAttributes
          }
        : {
            profileId: values.profileId
          })
    }

    try {
      await save(competitorParams)
      hide()
    } catch (err) {
      formikBag.setSubmitting(false)
      console.warn(err)
    }
  }

  return (
    <Modal isShown={true} onHide={hide} title="New competitor" size="sm">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, isSubmitting, touched, errors }) => (
          <form onSubmit={handleSubmit}>
            <Modal.Body>
              <div className={styles.inputGroup}>
                <label className={styles.radioInput}>
                  <Field type="radio" name="newProfile" value="false" />
                  <span>{t('competitors.form.select_profile')}</span>
                </label>
                <Field name="profileId">
                  {({
                    field: { name, ...props },
                    form: { setFieldValue },
                    meta: { touched, error }
                  }) => (
                    <>
                      <ProfileSelect
                        isInvalid={touched && error}
                        {...props}
                        onChange={option => setFieldValue(name, option.value)}
                      />
                    </>
                  )}
                </Field>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.radioInput}>
                  <Field type="radio" name="newProfile" value="true" />
                  <span>{t('competitors.form.create_profile')}</span>
                </label>
                <div className={styles.newProfileGroup}>
                  <label>{t('activerecord.attributes.profile.name')}</label>
                  <Field
                    name="profileAttributes[name]"
                    data-invalid={
                      errors?.profileAttributes?.name && touched?.profileAttributes?.name
                    }
                    className={styles.input}
                  />

                  <label>{t('activerecord.attributes.profile.country')}</label>
                  <Field name="profileAttributes[countryId]">
                    {({
                      field: { name, ...props },
                      form: { setFieldValue },
                      meta: { touched, error }
                    }) => (
                      <CountrySelect
                        isInvalid={touched && error}
                        {...props}
                        onChange={option => setFieldValue(name, option.value)}
                      />
                    )}
                  </Field>
                </div>
              </div>

              <hr />

              <div className={styles.inputGroup}>
                <label htmlFor="assignedValue">
                  {t('activerecord.attributes.event/competitor.assigned_number')}
                </label>
                <Field
                  name="assignedNumber"
                  id="assignedValue"
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>{t('activerecord.attributes.event/competitor.section')}</label>
                <Field name="categoryId">
                  {({
                    field: { name, ...props },
                    form: { setFieldValue },
                    meta: { touched, error }
                  }) => (
                    <>
                      <CategorySelect
                        isInvalid={touched && error}
                        eventId={eventId}
                        {...props}
                        menuPortalTarget={document.getElementById('dropdowns-root')}
                        onChange={option => setFieldValue(name, option.value)}
                      />
                    </>
                  )}
                </Field>
              </div>
            </Modal.Body>

            <Modal.Footer>
              <button
                className={styles.primaryButton}
                type="submit"
                disabled={isSubmitting}
              >
                {t('general.save')}
              </button>
              <button
                className={styles.secondaryButton}
                type="button"
                disabled={isSubmitting}
                data-dismiss="modal"
                onClick={hide}
              >
                {t('general.cancel')}
              </button>
            </Modal.Footer>
          </form>
        )}
      </Formik>
    </Modal>
  )
}

CompetitorForm.propTypes = {
  eventId: PropTypes.number.isRequired,
  initialValues: PropTypes.shape({
    profileId: PropTypes.number,
    categoryId: PropTypes.number,
    assignedNumber: PropTypes.number
  }),
  onSubmit: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired
}

export default CompetitorForm
