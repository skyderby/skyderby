import React from 'react'
import { Formik, Field, FastField, FieldProps, FormikHelpers } from 'formik'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import RadioButtonGroup from 'components/ui/RadioButtonGroup'
import TrackSuitField from 'components/TrackSuitField'
import TrackLocationField from 'components/TrackLocationField'
import AltitudeRangeField from './AltitudeRangeField'
import styles from './styles.module.scss'
import { TrackVariables } from 'api/tracks'
import { FormData } from 'components/Tracks/Track/TrackEdit/types'

type EditFormProps = {
  fields: TrackVariables & { id: number }
  onSubmit: (values: FormData, formikBag: FormikHelpers<FormData>) => Promise<unknown>
  onDelete: () => unknown
}

const EditForm = ({ fields, onSubmit, onDelete }: EditFormProps): JSX.Element => {
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
            {({ field }: FieldProps) => (
              <textarea
                className={styles.input}
                rows={3}
                placeholder={t('static_pages.index.track_form.comment_plh')}
                {...field}
              />
            )}
          </Field>

          <hr />

          <div className={styles.footer}>
            <button className={styles.dangerButton} type="button" onClick={onDelete}>
              {t('general.delete')}
            </button>

            <div>
              <button className={styles.primaryButton} type="submit">
                {t('general.save')}
              </button>
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
  onDelete: PropTypes.func.isRequired
}

export default EditForm
