import React from 'react'
import { Formik, Field, FieldArray } from 'formik'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import Modal from 'components/ui/Modal'
import PlusIcon from 'icons/plus.svg'
import CompetitorSelect from './CompetitorSelect'
import styles from './styles.module.scss'

const Form = ({ initialValues, onSubmit, onCancel, isDeletable, onDelete }) => {
  const { t } = useI18n()

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={({ values, handleSubmit, setFieldValue, isSubmitting }) => (
        <form onSubmit={handleSubmit}>
          <Modal.Body className={styles.modalBody}>
            <div className={styles.formRow}>
              <label>Name</label>
              <Field className={styles.input} name="name" />
            </div>

            <FieldArray
              name="competitorIds"
              render={arrayHelpers => (
                <>
                  <div className={styles.competitorRow}>
                    <label>Competitors</label>
                    <button
                      className={styles.flatButton}
                      type="button"
                      onClick={() => arrayHelpers.push()}
                    >
                      <PlusIcon />
                    </button>
                  </div>

                  {values.competitorIds.map((id, idx) => (
                    <div className={styles.competitorRow} key={idx}>
                      <Field
                        as={CompetitorSelect}
                        name={`competitorIds[${idx}]`}
                        menuPortalTarget={document.getElementById('dropdowns-root')}
                        onChange={value => setFieldValue(`competitorIds[${idx}]`, value)}
                      />
                      <button
                        className={styles.flatButton}
                        onClick={() => arrayHelpers.remove(idx)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </>
              )}
            />
          </Modal.Body>
          <Modal.Footer spaceBetween>
            <div>
              {isDeletable && (
                <button
                  className={styles.deleteButton}
                  type="button"
                  onClick={onDelete}
                  disabled={isSubmitting}
                >
                  {t('general.delete')}
                </button>
              )}
            </div>
            <div>
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
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {t('general.cancel')}
              </button>
            </div>
          </Modal.Footer>
        </form>
      )}
    />
  )
}

Form.propTypes = {
  initialValues: PropTypes.shape({
    name: PropTypes.string.isRequired,
    competitorIds: PropTypes.arrayOf(PropTypes.number).isRequired
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isDeletable: PropTypes.bool,
  onDelete: PropTypes.func
}

Form.defaultProps = {
  isDeletable: false,
  onDelete: () => {}
}

export default Form
