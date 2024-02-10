import React from 'react'
import { AxiosError } from 'axios'
import { UseMutationResult } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ValueType } from 'react-select'
import { Formik, Field, FieldArray, FormikHelpers } from 'formik'

import { useI18n } from 'components/TranslationsProvider'
import Modal from 'components/ui/Modal'
import RequestErrorToast from 'components/RequestErrorToast'
import PlusIcon from 'icons/plus.svg'
import TimesIcon from 'icons/times.svg'
import CompetitorSelect from './CompetitorSelect'
import validationSchema from './validationSchema'
import styles from './styles.module.scss'

interface TeamVariables {
  name: string
  competitorIds: number[]
}

const defaultValues = {
  name: '',
  competitorIds: []
}

type TeamFormProps<TCompetitor> = {
  eventId: number
  title: string
  mutation: UseMutationResult<
    unknown,
    AxiosError<Record<string, string[]>>,
    TeamVariables
  >
  competitors: TCompetitor[]
  onHide: () => void
  initialValues?: TeamVariables
}

function TeamForm<TCompetitor extends { id: number; profileId: number }>({
  eventId,
  title,
  mutation,
  competitors,
  onHide: hide,
  initialValues = defaultValues
}: TeamFormProps<TCompetitor>) {
  const { t } = useI18n()

  const handleSubmit = async (
    values: TeamVariables,
    formikBag: FormikHelpers<TeamVariables>
  ) => {
    mutation.mutate(values, {
      onSuccess: () => hide(),
      onSettled: () => formikBag.setSubmitting(false),
      onError: error => {
        toast.error(<RequestErrorToast response={error.response} />)
      }
    })
  }

  return (
    <Modal isShown={true} onHide={hide} title={title} size="sm">
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {({ handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <Modal.Body className={styles.modalBody}>
              <div className={styles.formRow}>
                <label>Name</label>
                <Field className={styles.input} name="name" />
              </div>

              <FieldArray name="competitorIds">
                {({ push, remove, form: { setFieldValue, values } }) => (
                  <>
                    <div className={styles.competitorRow}>
                      <label>Competitors</label>
                      <button
                        className={styles.flatButton}
                        type="button"
                        onClick={() => push({})}
                      >
                        <PlusIcon />
                      </button>
                    </div>

                    {values.competitorIds.map((_id: number, idx: number) => (
                      <div className={styles.competitorRow} key={idx}>
                        <Field
                          as={CompetitorSelect}
                          name={`competitorIds[${idx}]`}
                          eventId={eventId}
                          competitors={competitors}
                          menuPortalTarget={document.getElementById('dropdowns-root')}
                          onChange={(option: ValueType<{ value: number }, false>) => {
                            if (option === null) {
                              setFieldValue(`competitorIds[${idx}]`, null)
                            } else {
                              setFieldValue(`competitorIds[${idx}]`, option.value)
                            }
                          }}
                        />
                        <button className={styles.flatButton} onClick={() => remove(idx)}>
                          <TimesIcon />
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </FieldArray>
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

export default TeamForm
