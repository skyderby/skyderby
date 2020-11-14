import React from 'react'
import { Formik, Field } from 'formik'
import PropTypes from 'prop-types'

import Api from 'api'
import { useI18n } from 'components/TranslationsProvider'
import Input from 'components/ui/Input'
import Modal from 'components/ui/Modal'
import RadioButtonGroup from 'components/ui/RadioButtonGroup'
import TrackSuitField from 'components/TrackSuitField'

import ErrorMessage from 'components/ui/ErrorMessage'
import TrackFileInput from './TrackFileInput'
import SegmentSelect from './SegmentSelect'
import buildValidationSchema from './validationSchema'
import styles from './styles.module.scss'

const NewTrackForm = ({ isShown, onHide, loggedIn }) => {
  const { t } = useI18n()

  const initialValues = {
    name: loggedIn ? null : '',
    comment: '',
    location: '',
    suitId: null,
    missingSuitName: '',
    kind: 'skydive',
    visibility: 'public_track',
    trackFileId: null,
    segment: 0,
    formSupportData: {
      suitInputMode: 'select',
      segments: []
    }
  }

  const handleSubmit = async (
    { formSupportData, suitId, missingSuitName, ...values },
    actions
  ) => {
    const params = {
      ...values,
      ...(formSupportData.suitInputMode === 'select' ? { suitId } : { missingSuitName })
    }

    try {
      const track = await Api.Track.createRecord(params)

      Turbolinks.visit(`/tracks/${track.id}`)

      actions.setSubmitting(false)
    } catch (err) {
      console.warn(err)
    }
  }

  return (
    <Modal isShown={isShown} onHide={onHide}>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={buildValidationSchema(loggedIn)}
      >
        {({ values, handleSubmit, isSubmitting, resetForm, touched, errors }) => (
          <form onSubmit={handleSubmit}>
            <Modal.Body className={styles.container}>
              {!loggedIn && (
                <>
                  <label>{t('activerecord.attributes.track.name')}</label>
                  <div className={styles.formGroup}>
                    <Field
                      as={Input}
                      name="name"
                      placeholder={t('static_pages.index.track_form.name_plh')}
                      isInvalid={Boolean(touched.name && errors.name)}
                    />
                    {touched.name && errors.name && (
                      <ErrorMessage>{errors.name}</ErrorMessage>
                    )}
                  </div>
                </>
              )}

              <label>{t('activerecord.attributes.track.suit')}</label>
              <TrackSuitField />

              <label>{t('activerecord.attributes.track.place')}</label>
              <div className={styles.formGroup}>
                <Field
                  as={Input}
                  name="location"
                  isInvalid={touched.location && errors.location}
                  placeholder={t('static_pages.index.track_form.location_plh')}
                />

                {touched.location && errors.location && (
                  <ErrorMessage>{errors.location}</ErrorMessage>
                )}
              </div>

              <label>{t('activerecord.attributes.track.kind')}</label>
              <Field
                as={RadioButtonGroup}
                name="kind"
                options={[
                  { value: 'skydive', label: 'Skydive' },
                  { value: 'base', label: 'B.A.S.E' }
                ]}
              />

              {loggedIn && (
                <>
                  <label>{t('tracks.edit.visibility')}</label>
                  <Field
                    as={RadioButtonGroup}
                    name="visibility"
                    options={[
                      { value: 'public_track', label: t('visibility.public') },
                      { value: 'unlisted_track', label: t('visibility.unlisted') },
                      { value: 'private_track', label: t('visibility.private') }
                    ]}
                  />
                </>
              )}

              <label>{t('activerecord.attributes.track_file.file')}</label>
              <div className={styles.formGroup}>
                <Field name="trackFileId">
                  {({ field: { name }, form: { setFieldValue } }) => (
                    <TrackFileInput
                      isInvalid={touched.trackFile && errors.trackFile}
                      onUploadStart={() =>
                        setFieldValue('formSupportData.isUploading', true)
                      }
                      onUploadEnd={() =>
                        setFieldValue('formSupportData.isUploading', false)
                      }
                      onChange={({ id, segmentsCount, segments }) => {
                        setFieldValue(name, id)
                        setFieldValue('formSupportData.segments', segments || [])
                        setFieldValue('formSupportData.segmentsCount', segmentsCount)
                      }}
                    />
                  )}
                </Field>

                {touched.trackFileId && errors.trackFileId && (
                  <ErrorMessage>{errors.trackFileId}</ErrorMessage>
                )}
              </div>

              {(values.formSupportData.segmentsCount || 0) > 1 && (
                <>
                  <label>{t('activerecord.attributes.track_file.segment')}</label>
                  <div className={styles.formGroup}>
                    <Field name="segment">
                      {({ field: { name, value }, form: { setFieldValue } }) => (
                        <SegmentSelect
                          options={values.formSupportData.segments.map(
                            (segment, idx) => ({
                              value: idx,
                              label: segment.name,
                              segment
                            })
                          )}
                          value={value}
                          onChange={value => setFieldValue(name, value)}
                        />
                      )}
                    </Field>
                  </div>
                </>
              )}

              <label>{t('activerecord.attributes.track.comment')}</label>
              <Field name="comment">
                {({ field }) => (
                  <Input
                    as="textarea"
                    rows={3}
                    placeholder={t('static_pages.index.track_form.comment_plh')}
                    {...field}
                  />
                )}
              </Field>
            </Modal.Body>

            <Modal.Footer>
              <button
                className={styles.primaryButton}
                type="submit"
                disabled={isSubmitting || values.formSupportData.isUploading}
              >
                {t('static_pages.index.track_form.submit')}
              </button>
              <button
                className={styles.secondaryButton}
                type="button"
                disabled={isSubmitting || values.formSupportData.isUploading}
                data-dismiss="modal"
                onClick={resetForm}
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

NewTrackForm.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  isShown: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired
}

export default NewTrackForm
