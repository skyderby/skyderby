import React from 'react'
import { Formik, Field, FieldArray } from 'formik'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import Modal from 'components/ui/Modal'
import PlusIcon from 'icons/plus.svg'
import TimesIcon from 'icons/times.svg'
import CompetitorSelect from './CompetitorSelect'
import validationSchema from './validationSchema'
import styles from './styles.module.scss'

const defaultValues = {
  name: '',
  competitorIds: []
}

const TeamForm = ({
  eventId,
  title,
  mutation,
  onHide: hide,
  initialValues = defaultValues
}) => {
  const { t } = useI18n()

  const handleSubmit = async (values, formikBag) => {
    try {
      await mutation.mutateAsync({ eventId, ...values })
      hide()
    } catch (err) {
      alert(err)
      formikBag.setSubmitting(false)
    }
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
                        onClick={() => push()}
                      >
                        <PlusIcon />
                      </button>
                    </div>

                    {values.competitorIds.map((id, idx) => (
                      <div className={styles.competitorRow} key={idx}>
                        <Field
                          as={CompetitorSelect}
                          name={`competitorIds[${idx}]`}
                          eventId={eventId}
                          menuPortalTarget={document.getElementById('dropdowns-root')}
                          onChange={option =>
                            setFieldValue(`competitorIds[${idx}]`, option.value)
                          }
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

TeamForm.propTypes = {
  eventId: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  mutation: PropTypes.shape({
    mutateAsync: PropTypes.func.isRequired
  }).isRequired,
  onHide: PropTypes.func.isRequired,
  initialValues: PropTypes.shape({
    name: PropTypes.string.isRequired,
    competitorIds: PropTypes.arrayOf(PropTypes.number).isRequired
  })
}

export default TeamForm
