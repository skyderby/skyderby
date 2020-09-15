import React from 'react'
import { Formik, Field } from 'formik'
import PropTypes from 'prop-types'

import Api from 'api'
import { useI18n } from 'components/TranslationsProvider'
import Label from 'components/ui/Label'
import Input from 'components/ui/Input'
import DefaultButton from 'components/ui/buttons/Default'
import PrimaryButton from 'components/ui/buttons/Primary'
import RadioButtonGroup from 'components/ui/RadioButtonGroup'
import TrackSuitField from 'components/TrackSuitField'

import TrackFileInput from './TrackFileInput'
import SegmentSelect from './SegmentSelect'
import { Form, Footer, InputContainer, ErrorMessage } from './elements'
import buildValidationSchema from './validationSchema'

const NewTrackForm = ({ loggedIn }) => {
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
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={buildValidationSchema(loggedIn)}
    >
      {({ values, handleSubmit, isSubmitting, resetForm, touched, errors }) => (
        <Form onSubmit={handleSubmit}>
          {loggedIn || (
            <>
              <Label>{t('activerecord.attributes.track.name')}</Label>
              <InputContainer>
                <Field
                  as={Input}
                  name="name"
                  placeholder={t('static_pages.index.track_form.name_plh')}
                  isInvalid={Boolean(touched.name && errors.name)}
                />
                {touched.name && errors.name && (
                  <ErrorMessage>{errors.name}</ErrorMessage>
                )}
              </InputContainer>
            </>
          )}

          <Label>{t('activerecord.attributes.track.suit')}</Label>
          <TrackSuitField />

          <Label>{t('activerecord.attributes.track.place')}</Label>
          <InputContainer>
            <Field
              as={Input}
              name="location"
              isInvalid={touched.location && errors.location}
              placeholder={t('static_pages.index.track_form.location_plh')}
            />

            {touched.location && errors.location && (
              <ErrorMessage>{errors.location}</ErrorMessage>
            )}
          </InputContainer>

          <Label>{t('activerecord.attributes.track.kind')}</Label>
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
              <Label>{t('tracks.edit.visibility')}</Label>
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

          <Label>{t('activerecord.attributes.track_file.file')}</Label>
          <InputContainer>
            <Field name="trackFileId">
              {({ field: { name }, form: { setFieldValue } }) => (
                <TrackFileInput
                  isInvalid={touched.trackFile && errors.trackFile}
                  onUploadStart={() => setFieldValue('formSupportData.isUploading', true)}
                  onUploadEnd={() => setFieldValue('formSupportData.isUploading', false)}
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
          </InputContainer>

          {(values.formSupportData.segmentsCount || 0) > 1 && (
            <>
              <Label>{t('activerecord.attributes.track_file.segment')}</Label>
              <InputContainer>
                <Field name="segment">
                  {({ field: { name, value }, form: { setFieldValue } }) => (
                    <SegmentSelect
                      options={values.formSupportData.segments.map((segment, idx) => ({
                        value: idx,
                        label: segment.name,
                        segment
                      }))}
                      value={value}
                      onChange={value => setFieldValue(name, value)}
                    />
                  )}
                </Field>
              </InputContainer>
            </>
          )}

          <Label>{t('activerecord.attributes.track.comment')}</Label>
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

          <Footer>
            <PrimaryButton
              type="submit"
              disabled={isSubmitting || values.formSupportData.isUploading}
            >
              {t('static_pages.index.track_form.submit')}
            </PrimaryButton>
            <DefaultButton
              type="button"
              disabled={isSubmitting || values.formSupportData.isUploading}
              data-dismiss="modal"
              onClick={resetForm}
            >
              {t('general.cancel')}
            </DefaultButton>
          </Footer>
        </Form>
      )}
    </Formik>
  )
}

NewTrackForm.propTypes = {
  loggedIn: PropTypes.bool.isRequired
}

export default NewTrackForm
