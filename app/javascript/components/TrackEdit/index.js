import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'

import { createTrackSelector, deleteTrack, updateTrack } from 'redux/tracks'
import { useI18n } from 'components/TranslationsProvider'
import BackLink from 'components/ui/BackLink'
import Form from './Form'
import styles from './styles.module.scss'

const TrackEdit = ({ trackId, returnTo }) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const track = useSelector(createTrackSelector(trackId))
  const { t } = useI18n()

  const handleSubmit = async (formValues, { setSubmitting }) => {
    const values = {
      jumpRange: formValues.jumpRange,
      kind: formValues.kind,
      visibility: formValues.visibility,
      comment: formValues.comment,
      ...(formValues.formSupportData.suitInputMode === 'input'
        ? { suitId: null, missingSuitName: formValues.missingSuitName }
        : { suitId: formValues.suitId, missingSuitName: null }),
      ...(formValues.formSupportData.placeInputMode === 'input'
        ? { placeId: null, location: formValues.location }
        : { placeId: formValues.placeId, location: null })
    }

    await dispatch(updateTrack(trackId, values))

    setSubmitting(false)

    history.push(`/tracks/${trackId}`)
  }

  const handleDelete = async () => {
    const confirmed = confirm(t('tracks.show.delete_confirmation'))

    if (!confirmed) return

    await dispatch(deleteTrack(track.id))

    history.push(returnTo)
  }

  const handleCancel = () => {
    history.goBack()
  }

  if (!track || track.status === 'loading') return null

  const fields = {
    ...track,
    missingSuitName: track.missingSuitName || '',
    location: track.location || ''
  }

  return (
    <div className={styles.pageContainer}>
      <BackLink to={`/tracks/${trackId}`}>{t('general.back')}</BackLink>

      <div className={styles.formContainer}>
        <Form
          fields={fields}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}

TrackEdit.propTypes = {
  trackId: PropTypes.number.isRequired,
  returnTo: PropTypes.string.isRequired
}

export default TrackEdit
