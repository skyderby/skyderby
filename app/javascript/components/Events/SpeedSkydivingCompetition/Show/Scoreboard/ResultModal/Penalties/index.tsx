import React from 'react'
import { Formik, Field, FieldArray, FormikHelpers, FormikErrors } from 'formik'

import Modal from 'components/ui/Modal'
import { useI18n } from 'components/TranslationsProvider'
import {
  Result,
  SpeedSkydivingCompetition,
  useSetResultPenaltiesMutation
} from 'api/speedSkydivingCompetitions'
import PlusIcon from 'icons/plus'
import TimesIcon from 'icons/times'
import validationSchema from './validationSchema'
import styles from '../styles.module.scss'

type PenaltiesProps = {
  event: SpeedSkydivingCompetition
  result: Result
  tabBar: JSX.Element | null
  hide: () => void
}

type FormData = {
  penalties: Result['penalties']
}

const Penalties = ({ event, result, tabBar, hide }: PenaltiesProps): JSX.Element => {
  const { t } = useI18n()
  const mutation = useSetResultPenaltiesMutation(event.id, result.id)

  const initialValues = { penalties: result.penalties || [] }

  const handleSave = (values: FormData, formikBag: FormikHelpers<FormData>) => {
    mutation.mutate(
      { penaltiesAttributes: values.penalties },
      { onSettled: () => formikBag.setSubmitting(false), onSuccess: () => hide() }
    )
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSave}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, isSubmitting, values, errors, touched }) => (
        <form onSubmit={handleSubmit}>
          <Modal.Body>
            {tabBar}
            {tabBar && <hr />}
            <FieldArray name="penalties">
              {({ push, remove }) => (
                <>
                  <div className={styles.penaltyRow}>
                    <label>Size, %</label>
                    <label>Reason</label>
                    <button
                      type="button"
                      onClick={() => push({ percent: '', reason: '' })}
                      className={styles.flatButton}
                    >
                      <PlusIcon />
                    </button>
                  </div>
                  {values.penalties.map((_, idx) => {
                    const rowErrors =
                      typeof errors?.penalties?.[idx] === 'object'
                        ? (errors?.penalties?.[idx] as FormikErrors<
                            Result['penalties'][number]
                          >)
                        : {}

                    return (
                      <div className={styles.penaltyRow} key={idx}>
                        <Field
                          name={`penalties.${idx}.percent`}
                          type="number"
                          className={styles.input}
                          data-invalid={
                            rowErrors.percent && touched?.penalties?.[idx]?.percent
                          }
                          placeholder="0..100%"
                        />
                        <Field
                          name={`penalties.${idx}.reason`}
                          className={styles.input}
                          data-invalid={
                            rowErrors.reason && touched?.penalties?.[idx]?.reason
                          }
                          placeholder="Specify a reason"
                        />
                        <button
                          type="button"
                          onClick={() => remove(idx)}
                          className={styles.flatButton}
                        >
                          <TimesIcon />
                        </button>
                      </div>
                    )
                  })}
                </>
              )}
            </FieldArray>
          </Modal.Body>
          <Modal.Footer>
            <div className={styles.footerRight}>
              {event.permissions.canEdit && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.primaryButton}
                >
                  {t('general.save')}
                </button>
              )}
              <button
                type="button"
                disabled={isSubmitting}
                className={styles.defaultButton}
                onClick={hide}
              >
                {t('general.back')}
              </button>
            </div>
          </Modal.Footer>
        </form>
      )}
    </Formik>
  )
}

export default Penalties
