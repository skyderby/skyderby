import React from 'react'
import { Formik, Field, FormikHelpers, FieldProps, ErrorMessage } from 'formik'
import { ValueType } from 'react-select'
import toast from 'react-hot-toast'
import { UseMutationResult } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import Modal from 'components/ui/Modal'
import { useI18n } from 'components/TranslationsProvider'
import RequestErrorToast from 'components/RequestErrorToast'
import validationSchema from './validationSchema'
import styles from './styles.module.scss'
import PerformanceCompetitionSelect from './PerformanceCompetitionSelect'
import ErrorText from 'components/ui/ErrorMessage'

type FormData = {
  sourceEventId: number | null
}

type CopyFromOtherEventFormProps = {
  mutation: UseMutationResult<
    unknown,
    AxiosError<Record<string, string[]>>,
    {
      sourceEventId: number
    }
  >
  onHide: () => void
}

const initialValues: FormData = { sourceEventId: null }

const CopyFromOtherEventForm = ({
  mutation,
  onHide: hide
}: CopyFromOtherEventFormProps) => {
  const { t } = useI18n()

  const handleSubmit = async (values: FormData, formikBag: FormikHelpers<FormData>) => {
    if (values.sourceEventId === null) return

    mutation.mutate(
      { sourceEventId: values.sourceEventId },
      {
        onSuccess: hide,
        onSettled: () => formikBag.setSubmitting(false),
        onError: error => {
          toast.error(<RequestErrorToast response={error.response} />)
        }
      }
    )
  }

  return (
    <Modal
      isShown={true}
      onHide={hide}
      title="Copy competitors from other scoreboard"
      size="sm"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <Modal.Body>
              <div className={styles.inputGroup}>
                <label>Source scoreboard</label>
                <Field name="sourceEventId">
                  {({
                    field: { name, ...props },
                    form: { setFieldValue },
                    meta: { touched, error }
                  }: FieldProps) => (
                    <>
                      <PerformanceCompetitionSelect
                        isInvalid={touched && error}
                        {...props}
                        menuPortalTarget={document.getElementById('dropdowns-root')}
                        onChange={(
                          option: ValueType<
                            {
                              value: number
                            },
                            false
                          >
                        ) => {
                          if (option === null) {
                            setFieldValue(name, null)
                          } else {
                            setFieldValue(name, option.value)
                          }
                        }}
                      />
                    </>
                  )}
                </Field>
                <ErrorMessage name="sourceEventId" component={ErrorText} />
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

export default CopyFromOtherEventForm
