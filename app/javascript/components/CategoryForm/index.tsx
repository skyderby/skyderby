import React from 'react'
import { Formik, Field, ErrorMessage, FormikHelpers } from 'formik'

import { useI18n } from 'components/TranslationsProvider'
import Modal from 'components/ui/Modal'
import ErrorText from 'components/ui/ErrorMessage'
import validationSchema from './validationSchema'
import styles from './styles.module.scss'
import toast from 'react-hot-toast'
import RequestErrorToast from 'components/RequestErrorToast'
import { UseMutationResult } from '@tanstack/react-query'
import { AxiosError } from 'axios'

interface FormData {
  name: string
}

type FormProps = {
  initialValues?: FormData
  mutation: UseMutationResult<unknown, AxiosError<Record<string, string[]>>, FormData>
  onHide: () => void
}

const defaultInitialValues = { name: '' }

const CategoryForm = ({
  initialValues = defaultInitialValues,
  mutation,
  onHide: hide
}: FormProps): JSX.Element => {
  const { t } = useI18n()

  const handleSubmit = async (values: FormData, formikBag: FormikHelpers<FormData>) => {
    mutation.mutate(values, {
      onSuccess: () => hide(),
      onSettled: () => formikBag.setSubmitting(false),
      onError: error => {
        toast.error(<RequestErrorToast response={error.response} />)
      }
    })
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

export default CategoryForm
