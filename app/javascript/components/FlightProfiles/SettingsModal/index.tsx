import React from 'react'
import { Formik, Field, FieldArray, FormikHelpers } from 'formik'
import { ValueType } from 'react-select'

import { useI18n } from 'components/TranslationsProvider'
import IconTimes from 'icons/times.svg'
import IconPlus from 'icons/plus.svg'
import Modal from 'components/ui/Modal'
import RadioButtonGroup from 'components/ui/RadioButtonGroup'
import TerrainProfileSelect from '../TerrainProfileSelect'
import styles from './styles.module.scss'

type FormData = {
  straightLine: string
  additionalTerrainProfiles: number[]
}

type SettingsModalProps = {
  isShown: boolean
  onHide: () => void
  initialValues: FormData
  onSubmit: (values: FormData, formikBag: FormikHelpers<FormData>) => void
}

const SettingsModal = ({
  onSubmit,
  isShown,
  onHide: handleHide,
  initialValues
}: SettingsModalProps): JSX.Element => {
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
                  name="straightLine"
                  options={[
                    { value: 'true', label: 'by straight line' },
                    { value: 'false', label: 'by trajectory' }
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
                        onClick={() => arrayHelpers.push(null)}
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
                          onChange={(option: ValueType<{ value: number }, false>) => {
                            setFieldValue(
                              `additionalTerrainProfiles[${idx}]`,
                              option ? option.value : option
                            )
                          }}
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

export default SettingsModal
