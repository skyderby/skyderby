import React from 'react'
import { Formik, Field, FastField } from 'formik'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import RadioButtonGroup from 'components/ui/RadioButtonGroup'
import DefaultButton from 'components/ui/buttons/Default'
import RedButton from 'components/ui/buttons/Red'
import PrimaryButton from 'components/ui/buttons/Primary'
import Input from 'components/ui/Input'
import TrackSuitField from 'components/TrackSuitField'
import TrackLocationField from 'components/TrackLocationField'

import AltitudeRangeField from './AltitudeRangeField'
import styles from './styles.module.scss'

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
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.altitudeRangeContainer}>
            <FastField
              name="jumpRange"
              component={AltitudeRangeField}
              trackId={fields.id}
            />
          </div>

          <hr />

          <label className={styles.label}>
            {t('activerecord.attributes.track.suit')}
          </label>
          <TrackSuitField />

          <label className={styles.label}>
            {t('activerecord.attributes.track.place')}
          </label>
          <TrackLocationField />

          <label className={styles.label}>
            {t('activerecord.attributes.track.kind')}
          </label>
          <Field
            as={RadioButtonGroup}
            name="kind"
            options={[
              { value: 'skydive', label: 'Skydive' },
              { value: 'base', label: 'B.A.S.E' }
            ]}
          />

          <label className={styles.label}>{t('tracks.edit.visibility')}</label>
          <Field
            as={RadioButtonGroup}
            name="visibility"
            options={[
              { value: 'public_track', label: t('visibility.public') },
              { value: 'unlisted_track', label: t('visibility.unlisted') },
              { value: 'private_track', label: t('visibility.private') }
            ]}
          />

          <label className={styles.label}>
            {t('activerecord.attributes.track.comment')}
          </label>
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

          <div className={styles.footer}>
            <RedButton type="button" outlined onClick={onDelete}>
              {t('general.delete')}
            </RedButton>

            <div>
              <PrimaryButton type="submit">{t('general.save')}</PrimaryButton>
              <DefaultButton type="button" onClick={onCancel}>
                {t('general.cancel')}
              </DefaultButton>
            </div>
          </div>
        </form>
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
