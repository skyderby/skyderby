import React from 'react'
import { Formik, Field } from 'formik'
import I18n from 'i18n-js'
import PropTypes from 'prop-types'

import FormGroup from 'components/ui/FormGroup'
import Label from 'components/ui/Label'
import Input from 'components/ui/Input'
import RadioButtonGroup from 'components/ui/RadioButtonGroup'
import FlatButton from 'components/ui/FlatButton'

import SuitSelect from './SuitSelect'
import TrackFileInput from './TrackFileInput'
import SegmentSelect from './SegmentSelect'
import { Form, InputContainer, SuitInputModeToggle } from './elements'

const NewTrackForm = ({ loggedIn }) => {
  const initialValues = {
    comment: '',
    location: '',
    suitInputMode: 'select',
    suitId: null,
    missingSuitName: '',
    kind: 'skydive',
    visibility: 'public_track',
    trackFile: null,
    segment: 0
  }

  const handleSubmit = console.log

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, handleSubmit, isSubmitting }) => (
        <Form onSubmit={handleSubmit}>
          {console.log(values)}
          {loggedIn || (
            <FormGroup>
              <Label>{I18n.t('activerecord.attributes.track.name')}</Label>
              <Field
                as={Input}
                name="name"
                placeholder={I18n.t('static_pages.index.track_form.name_plh')}
              />
            </FormGroup>
          )}

          <FormGroup>
            <Label>{I18n.t('activerecord.attributes.track.suit')}</Label>
            <InputContainer>
              {values.suitInputMode === 'select' ? (
                <Field name="suitId">
                  {({ field: { name, ...props }, form: { setFieldValue } }) => (
                    <SuitSelect
                      {...props}
                      onChange={value => setFieldValue(name, value)}
                    />
                  )}
                </Field>
              ) : (
                <Field
                  as={Input}
                  name="missingSuitName"
                  placeholder={I18n.t('tracks.form.suit_text_placeholder')}
                />
              )}

              <Field name="suitInputMode">
                {({ field: { value }, form: { setFieldValue } }) => (
                  <SuitInputModeToggle>
                    <span>
                      {value === 'select'
                        ? I18n.t('tracks.form.toggle_suit_caption')
                        : I18n.t('tracks.form.toggle_suit_caption_select')}
                    </span>
                    <FlatButton
                      as="span"
                      onClick={() =>
                        setFieldValue(
                          'suitInputMode',
                          value === 'select' ? 'input' : 'select'
                        )
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
          </FormGroup>

          <FormGroup>
            <Label>{I18n.t('activerecord.attributes.track.place')}</Label>
            <Field
              as={Input}
              name="location"
              placeholder={I18n.t('static_pages.index.track_form.location_plh')}
            />
          </FormGroup>

          <FormGroup>
            <Label>{I18n.t('activerecord.attributes.track.kind')}</Label>
            <Field
              as={RadioButtonGroup}
              name="kind"
              options={[
                { value: 'skydive', label: 'Skydive' },
                { value: 'base', label: 'B.A.S.E' }
              ]}
            />
          </FormGroup>

          {loggedIn && (
            <FormGroup>
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
            </FormGroup>
          )}

          <FormGroup>
            <Label>{I18n.t('activerecord.attributes.track_file.file')}</Label>
            <InputContainer>
              <Field name="trackFile">
                {({ field: { name }, form: { setFieldValue } }) => (
                  <TrackFileInput onChange={value => setFieldValue(name, value)} />
                )}
              </Field>
              {(values.trackFile?.segmentsCount || 0) > 1 && (
                <Field name="segment">
                  {({ field: { name, value }, form: { setFieldValue } }) => (
                    <SegmentSelect
                      options={values.trackFile.segments.map((segment, idx) => ({
                        value: idx,
                        label: segment.name,
                        segment
                      }))}
                      value={value}
                      onChange={value => setFieldValue(name, value)}
                    />
                  )}
                </Field>
              )}
            </InputContainer>
          </FormGroup>

          <FormGroup>
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
          </FormGroup>
        </Form>
      )}
    </Formik>
  )
}

NewTrackForm.propTypes = {
  loggedIn: PropTypes.bool.isRequired
}

export default NewTrackForm
