import React from 'react'
import { Formik, Field, FastField } from 'formik'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import RadioButtonGroup from 'components/ui/RadioButtonGroup'
import DefaultButton from 'components/ui/buttons/Default'
import RedButton from 'components/ui/buttons/Red'
import PrimaryButton from 'components/ui/buttons/Primary'
import Label from 'components/ui/Label'
import Input from 'components/ui/Input'
import TrackSuitField from 'components/TrackSuitField'
import TrackLocationField from 'components/TrackLocationField'

import AltitudeRangeField from './AltitudeRangeField'
import { Form, AltitudeRangeContainer, Footer } from './elements'

const EditForm = ({ fields, onSubmit, onDelete, onCancel }) => {
  const { t } = useI18n()

  return (
    <Formik
      initialValues={{
        ...fields,
        formSupportData: {
          suitInputMode: fields.suitId ? 'select' : 'input',
          placeInputMode: fields.placeId ? 'select' : 'input'
        }
      }}
      onSubmit={onSubmit}
    >
      {({ handleSubmit }) => (
        <Form onSubmit={handleSubmit}>
          <AltitudeRangeContainer>
            <FastField
              name="jumpRange"
              component={AltitudeRangeField}
              trackId={fields.id}
            />
          </AltitudeRangeContainer>

          <hr />

          <Label>{t('activerecord.attributes.track.suit')}</Label>
          <TrackSuitField />

          <Label>{t('activerecord.attributes.track.place')}</Label>
          <TrackLocationField />

          <Label>{t('activerecord.attributes.track.kind')}</Label>
          <Field
            as={RadioButtonGroup}
            name="kind"
            options={[
              { value: 'skydive', label: 'Skydive' },
              { value: 'base', label: 'B.A.S.E' }
            ]}
          />

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

          <hr />

          <Footer>
            <RedButton type="button" outlined onClick={onDelete}>
              {t('general.delete')}
            </RedButton>

            <div>
              <PrimaryButton type="submit">{t('general.save')}</PrimaryButton>
              <DefaultButton type="button" onClick={onCancel}>
                {t('general.cancel')}
              </DefaultButton>
            </div>
          </Footer>
        </Form>
      )}
    </Formik>
  )
}

EditForm.propTypes = {
  fields: PropTypes.shape({
    id: PropTypes.number.isRequired,
    suitId: PropTypes.number,
    placeId: PropTypes.number,
    comment: PropTypes.string,
    jumpRange: PropTypes.shape({
      from: PropTypes.number.isRequired,
      to: PropTypes.number.isRequired
    }).isRequired,
    missingSuitName: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    visibility: PropTypes.oneOf(['public_track', 'unlisted_track', 'private_track']),
    kind: PropTypes.oneOf(['skydive', 'base'])
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
}

export default EditForm
