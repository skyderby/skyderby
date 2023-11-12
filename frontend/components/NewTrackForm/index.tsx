'use client'

import React from 'react'
import { Formik, Field, FieldProps } from 'formik'

// import {
//   useCreateTrackMutation,
//   TrackActivity,
//   TrackFileRecord,
//   TrackVisibility
// } from 'api/tracks'
// import { useI18n } from 'components/TranslationsProvider'
import Modal from 'components/Modal'
import RadioButtonGroup from 'components/RadioButtonGroup'
// import TrackSuitField from 'components/TrackSuitField'

import ErrorMessage from 'components/ErrorMessage'
// import TrackFileInput from './TrackFileInput'
// import SegmentSelect from './SegmentSelect'
import validationSchema from './validationSchema'
import styles from './styles.module.scss'

type NewTrackFormProps = {
  isShown: boolean
  onHide: () => unknown
}

type SegmentType = {
  name: string
}

type FormData = {
  // kind: TrackActivity
  // visibility: TrackVisibility
  location: string | null
  suitId: number | null
  missingSuitName: string | null
  trackFileId: number | null
  segment: number
  comment: string
  formSupportData: {
    suitInputMode: 'input' | 'select'
    segments: SegmentType[]
    isUploading?: boolean
    segmentsCount?: number
  }
}

const NewTrackForm = ({ isShown, onHide }: NewTrackFormProps): JSX.Element => {
  const t = txt => txt
  // const navigate = useNavigate()
  // const newTrackMutation = useCreateTrackMutation()

  const initialValues: FormData = {
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

  const handleSubmit = async ({
    formSupportData,
    suitId,
    missingSuitName,
    ...values
  }: FormData) => {
    const params = {
      ...values,
      ...(formSupportData.suitInputMode === 'select' ? { suitId } : { missingSuitName })
    }

    try {
      // const { data: track } = await newTrackMutation.mutateAsync(params)
      // navigate(`/tracks/${track.id}`)
    } catch (err) {
      console.warn(err)
    }
  }

  return (
    <Modal
      isShown={isShown}
      onHide={onHide}
      title={t('static_pages.index.track_form.title')}
    >
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {({
          values,
          handleSubmit,
          isSubmitting,
          resetForm,
          setFieldValue,
          touched,
          errors
        }) => (
          <form onSubmit={handleSubmit}>
            <Modal.Body className={styles.container}>
              <label>{t('activerecord.attributes.track.suit')}</label>
              {/*<TrackSuitField />*/}

              <label>{t('activerecord.attributes.track.place')}</label>
              <div className={styles.formGroup}>
                <Field
                  className={styles.input}
                  name="location"
                  data-invalid={touched.location && errors.location}
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

              <label>{t('activerecord.attributes.track_file.file')}</label>
              <div className={styles.formGroup}>
                {/*<TrackFileInput*/}
                {/*  name="trackFileId"*/}
                {/*  onUploadStart={() => setFieldValue('formSupportData.isUploading', true)}*/}
                {/*  onUploadEnd={() => setFieldValue('formSupportData.isUploading', false)}*/}
                {/*  onChange={({ id, segmentsCount, segments }: TrackFileRecord) => {*/}
                {/*    setFieldValue('trackFileId', id)*/}
                {/*    setFieldValue('formSupportData.segments', segments || [])*/}
                {/*    setFieldValue('formSupportData.segmentsCount', segmentsCount)*/}
                {/*  }}*/}
                {/*/>*/}

                {touched.trackFileId && errors.trackFileId && (
                  <ErrorMessage>{errors.trackFileId}</ErrorMessage>
                )}
              </div>

              {(values.formSupportData.segmentsCount || 0) > 1 && (
                <>
                  <label>{t('activerecord.attributes.track_file.segment')}</label>
                  <div className={styles.formGroup}>
                    {/*<Field name="segment">*/}
                    {/*  {({*/}
                    {/*    field: { name, value },*/}
                    {/*    form: { setFieldValue }*/}
                    {/*  }: FieldProps) => (*/}
                    {/*    <SegmentSelect*/}
                    {/*      options={values.formSupportData.segments.map(*/}
                    {/*        (segment, idx) => ({*/}
                    {/*          value: idx,*/}
                    {/*          label: segment.name,*/}
                    {/*          segment*/}
                    {/*        })*/}
                    {/*      )}*/}
                    {/*      value={value}*/}
                    {/*      onChange={value => setFieldValue(name, value)}*/}
                    {/*    />*/}
                    {/*  )}*/}
                    {/*</Field>*/}
                  </div>
                </>
              )}

              <label>{t('activerecord.attributes.track.comment')}</label>
              <Field name="comment">
                {({ field }: FieldProps) => (
                  <textarea
                    className={styles.input}
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
                onClick={() => {
                  resetForm()
                  onHide()
                }}
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

export default NewTrackForm
