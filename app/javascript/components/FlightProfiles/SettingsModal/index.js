import React from 'react'
import { Formik, Field, FieldArray } from 'formik'
import PropTypes from 'prop-types'

import { STRAIGHT_LINE, TRAJECTORY_DISTANCE } from 'redux/userPreferences'
import { useI18n } from 'components/TranslationsProvider'
import IconTimes from 'icons/times.svg'
import IconPlus from 'icons/plus.svg'
import Modal from 'components/ui/Modal'
import RadioButtonGroup from 'components/ui/RadioButtonGroup'
import TerrainProfileSelect from '../TerrainProfileSelect'
import styles from './styles.module.scss'

const SettingsModal = ({ onSubmit, isShown, onHide: handleHide, initialValues }) => {
  const { t } = useI18n()

  return (
    <Modal isShown={isShown} onHide={handleHide} size="sm" title="View preferences">
      <Formik initialValues={initialValues} onSubmit={onSubmit}>
        {({ values, handleSubmit, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <Modal.Body className={styles.modalBody}>
              <div className={styles.formRow}>
                <label>Calculate distance</label>
                <Field
                  as={RadioButtonGroup}
                  name="calculateDistanceBy"
                  options={[
                    { value: STRAIGHT_LINE, label: 'by straight line' },
                    { value: TRAJECTORY_DISTANCE, label: 'by trajectory' }
                  ]}
                />
              </div>
              <FieldArray
                name="additionalTerrainProfiles"
                render={arrayHelpers => (
                  <>
                    <div className={styles.formRow}>
                      <label>Additional terrain profiles</label>
                      <button
                        type="button"
                        className={styles.flatButton}
                        onClick={() => arrayHelpers.push()}
                      >
                        <IconPlus />
                      </button>
                    </div>

                    {values.additionalTerrainProfiles.map((id, idx) => (
                      <div key={idx} className={styles.formRow}>
                        <TerrainProfileSelect
                          value={id}
                          isClearable={false}
                          menuPortalTarget={document.getElementById('dropdowns-root')}
                          onChange={value =>
                            setFieldValue(`additionalTerrainProfiles[${idx}]`, value.id)
                          }
                        />
                        <button
                          type="button"
                          className={styles.flatButton}
                          onClick={() => arrayHelpers.remove(idx)}
                        >
                          <IconTimes />
                        </button>
                      </div>
                    ))}
                  </>
                )}
              />
            </Modal.Body>

            <Modal.Footer>
              <button className={styles.primaryButton} type="submit">
                {t('general.save')}
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleHide}
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

SettingsModal.propTypes = {
  isShown: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape({
    calculateDistanceBy: PropTypes.oneOf([STRAIGHT_LINE, TRAJECTORY_DISTANCE]).isRequired,
    additionalTerrainProfiles: PropTypes.arrayOf(PropTypes.number).isRequired
  }).isRequired
}
export default SettingsModal
