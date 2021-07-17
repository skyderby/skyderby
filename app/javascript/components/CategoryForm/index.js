import React from 'react'
import { Formik, Field, ErrorMessage } from 'formik'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import Modal from 'components/ui/Modal'
import ErrorText from 'components/ui/ErrorMessage'
import validationSchema from './validationSchema'
import styles from './styles.module.scss'

const defaultInitialValues = { name: '' }

const CategoryForm = ({
  initialValues = defaultInitialValues,
  mutation,
  onHide: hide
}) => {
  const { t } = useI18n()

  const handleSubmit = async (values, formikBag) => {
    try {
      mutation.mutate(values)
    } catch (err) {
      formikBag.setSubmitting(false)
      console.warn(err)
    }
  }

  return (
    <Modal isShown={true} onHide={hide} title="New category" size="sm">
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {({ handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <Modal.Body>
              <div className={styles.formGroup}>
                <label>{t('activerecord.attributes.event/section.name')}</label>
                <div>
                  <Field name="name" className={styles.input} />
                  <ErrorMessage name="name" component={ErrorText} />
                </div>
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

CategoryForm.propTypes = {
  initialValues: PropTypes.shape({
    name: PropTypes.string
  }),
  mutation: PropTypes.shape({
    mutate: PropTypes.func.isRequired
  }).isRequired,
  onHide: PropTypes.func.isRequired
}

export default CategoryForm
