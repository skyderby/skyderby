import React from 'react'
import { useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'

import {
  useTrackQuery,
  useEditTrackMutation,
  useDeleteTrackMutation
} from 'api/hooks/tracks'
import { useI18n } from 'components/TranslationsProvider'
import TrackShowContainer from 'components/TrackShowContainer'
import Form from './Form'

const TrackEdit = ({ match, location }) => {
  const trackId = Number(match.params.id)
  const returnTo = location.state?.returnTo ?? '/tracks'

  const history = useHistory()
  const { data: track } = useTrackQuery(trackId)
  const editMutation = useEditTrackMutation()
  const deleteMutation = useDeleteTrackMutation()
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

    await editMutation.mutateAsync({ id: trackId, changes: values })

    setSubmitting(false)

    history.push(`/tracks/${trackId}`)
  }

  const handleDelete = async () => {
    const confirmed = confirm(t('tracks.show.delete_confirmation'))

    if (!confirmed) return

    await deleteMutation.mutateAsync(trackId)

    history.push(returnTo)
  }

  if (!track || track.status === 'loading') return null

  const fields = {
    ...track,
    missingSuitName: track.missingSuitName || '',
    location: track.location || ''
  }

  return (
    <TrackShowContainer>
      <Form fields={fields} onSubmit={handleSubmit} onDelete={handleDelete} />
    </TrackShowContainer>
  )
}

TrackEdit.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  location: PropTypes.shape({
    state: PropTypes.object
  })
}

export default TrackEdit
