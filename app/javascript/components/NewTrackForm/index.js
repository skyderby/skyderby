import React from 'react'
import { Formik, Field } from 'formik'
import I18n from 'i18n-js'
import PropTypes from 'prop-types'

import Api from 'api'
import Label from 'components/ui/Label'
import Input from 'components/ui/Input'
import DefaultButton from 'components/ui/buttons/Default'
import PrimaryButton from 'components/ui/buttons/Primary'
import RadioButtonGroup from 'components/ui/RadioButtonGroup'
import FlatButton from 'components/ui/FlatButton'

import SuitSelect from './SuitSelect'
import TrackFileInput from './TrackFileInput'
import SegmentSelect from './SegmentSelect'
import {
  Form,
  Footer,
  InputContainer,
  SuitInputModeToggle,
  ErrorMessage
} from './elements'
import buildValidationSchema from './validationSchema'

const NewTrackForm = ({ loggedIn }) => {
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
              <Label>{I18n.t('activerecord.attributes.track.name')}</Label>
              <InputContainer>
                <Field
                  as={Input}
                  name="name"
                  placeholder={I18n.t('static_pages.index.track_form.name_plh')}
                  isInvalid={Boolean(touched.name && errors.name)}
                />
                {touched.name && errors.name && (
                  <ErrorMessage>{errors.name}</ErrorMessage>
                )}
              </InputContainer>
            </>
          )}

          <Label>{I18n.t('activerecord.attributes.track.suit')}</Label>
          <InputContainer>
            <Field name="suitId">
              {({ field: { name, ...props }, form: { setFieldValue } }) => (
                <SuitSelect
                  hide={values.formSupportData.suitInputMode === 'input'}
                  isInvalid={touched.suitId && errors.suitId}
                  {...props}
                  onChange={value => setFieldValue(name, value)}
                />
              )}
            </Field>
            <Field
              as={Input}
              hide={values.formSupportData.suitInputMode === 'select'}
              isInvalid={touched.missingSuitName && errors.missingSuitName}
              name="missingSuitName"
              placeholder={I18n.t('tracks.form.suit_text_placeholder')}
            />

            {touched.suitId && errors.suitId && (
              <ErrorMessage>{errors.suitId}</ErrorMessage>
            )}
            {touched.missingSuitName && errors.missingSuitName && (
              <ErrorMessage>{errors.missingSuitName}</ErrorMessage>
            )}

            <Field name="formSupportData.suitInputMode">
              {({ field: { value, name }, form: { setFieldValue } }) => (
                <SuitInputModeToggle>
                  <span>
                    {value === 'select'
                      ? I18n.t('tracks.form.toggle_suit_caption')
                      : I18n.t('tracks.form.toggle_suit_caption_select')}
                  </span>
                  <FlatButton
                    as="span"
                    onClick={() =>
                      setFieldValue(name, value === 'select' ? 'input' : 'select')
                    }
                  >
                    {value === 'select'
                      ? I18n.t('tracks.form.toggle_suit_link')
                      : I18n.t('tracks.form.toggle_suit_link_select')}
                  </FlatButton>
                </SuitInputModeToggle>
              )}
            </Field>
          </InputContainer>

          <Label>{I18n.t('activerecord.attributes.track.place')}</Label>
          <InputContainer>
            <Field
              as={Input}
              name="location"
              isInvalid={touched.location && errors.location}
              placeholder={I18n.t('static_pages.index.track_form.location_plh')}
            />

            {touched.location && errors.location && (
              <ErrorMessage>{errors.location}</ErrorMessage>
            )}
          </InputContainer>

          <Label>{I18n.t('activerecord.attributes.track.kind')}</Label>
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
              <Label>{I18n.t('tracks.edit.visibility')}</Label>
              <Field
                as={RadioButtonGroup}
                name="visibility"
                options={[
                  { value: 'public_track', label: I18n.t('visibility.public') },
                  { value: 'unlisted_track', label: I18n.t('visibility.unlisted') },
                  { value: 'private_track', label: I18n.t('visibility.private') }
                ]}
              />
            </>
          )}

          <Label>{I18n.t('activerecord.attributes.track_file.file')}</Label>
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
              <Label>{I18n.t('activerecord.attributes.track_file.segment')}</Label>
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

          <Label>{I18n.t('activerecord.attributes.track.comment')}</Label>
          <Field name="comment">
            {({ field }) => (
              <Input
                as="textarea"
                rows={3}
                placeholder={I18n.t('static_pages.index.track_form.comment_plh')}
                {...field}
              />
            )}
          </Field>

          <Footer>
            <PrimaryButton
              type="submit"
              disabled={isSubmitting || values.formSupportData.isUploading}
            >
              {I18n.t('static_pages.index.track_form.submit')}
            </PrimaryButton>
            <DefaultButton
              type="button"
              disabled={isSubmitting || values.formSupportData.isUploading}
              data-dismiss="modal"
              onClick={resetForm}
            >
              {I18n.t('general.cancel')}
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
