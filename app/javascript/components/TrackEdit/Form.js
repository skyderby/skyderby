import React from 'react'
import { Formik, Field } from 'formik'
import PropTypes from 'prop-types'
import I18n from 'i18n-js'

import RadioButtonGroup from 'components/ui/RadioButtonGroup'
import AltitudeRangeSelect from 'components/AltitudeRangeSelect'
import DefaultButton from 'components/ui/buttons/Default'
import RedButton from 'components/ui/buttons/Red'
import PrimaryButton from 'components/ui/buttons/Primary'
import Label from 'components/ui/Label'
import Input from 'components/ui/Input'
import TrackSuitField from 'components/TrackSuitField'

import { Form, AltitudeRangeContainer, Footer } from './elements'

const EditForm = ({ track, onSubmit, onDelete, onCancel }) => {
  const initialValues = {
    jumpRange: track.jumpRange,
    suitId: track.suitId,
    missingSuitName: track.missingSuitName,
    kind: 'skydive',
    visibility: track.visibility,
    comment: track.comment,
    formSupportData: {
      suitInputMode: track.suitId ? 'select' : 'input'
    }
  }

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {({ values, setFieldValue, handleSubmit }) => (
        <Form onSubmit={handleSubmit}>
          <AltitudeRangeContainer>
            <AltitudeRangeSelect
              trackId={track.id}
              jumpRange={values.jumpRange}
              onChange={val => setFieldValue('jumpRange', val)}
            />
          </AltitudeRangeContainer>

          <hr />

          <Label>{I18n.t('activerecord.attributes.track.suit')}</Label>
          <TrackSuitField />

          <Label>{I18n.t('activerecord.attributes.track.place')}</Label>
          <input />

          <Label>{I18n.t('activerecord.attributes.track.kind')}</Label>
          <Field
            as={RadioButtonGroup}
            name="kind"
            options={[
              { value: 'skydive', label: 'Skydive' },
              { value: 'base', label: 'B.A.S.E' }
            ]}
          />

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

          <hr />

          <Footer>
            <RedButton type="button" outlined onClick={onDelete}>
              {I18n.t('general.delete')}
            </RedButton>

            <div>
              <PrimaryButton type="submit">{I18n.t('general.save')}</PrimaryButton>
              <DefaultButton type="button" onClick={onCancel}>
                {I18n.t('general.cancel')}
              </DefaultButton>
            </div>
          </Footer>
        </Form>
      )}
    </Formik>
  )
}

EditForm.propTypes = {
  track: PropTypes.shape({
    id: PropTypes.number.isRequired,
    suitId: PropTypes.number,
    comment: PropTypes.string,
    jumpRange: PropTypes.shape({
      from: PropTypes.number.isRequired,
      to: PropTypes.number.isRequired
    }).isRequired,
    missingSuitName: PropTypes.string,
    visibility: PropTypes.oneOf(['public_track', 'unlisted_track', 'private_track'])
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
}

export default EditForm
