import React from 'react'
import toast from 'react-hot-toast'
import { FormikHelpers } from 'formik'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  useTrackQuery,
  useUpdateTrackMutation,
  useDeleteTrackMutation,
  TrackVariables
} from 'api/tracks'
import { useI18n } from 'components/TranslationsProvider'
import PageContainer from 'components/Tracks/Track/PageContainer'
import Form from './Form'
import { FormData } from './types'
import RequestErrorToast from 'components/RequestErrorToast'

type TrackEditProps = {
  trackId: number
}

const TrackEdit = ({ trackId }: TrackEditProps) => {
  const location = useLocation()
  const returnTo = location.state?.returnTo ?? '/tracks'

  const navigate = useNavigate()
  const { data: track } = useTrackQuery(trackId)
  const editMutation = useUpdateTrackMutation(trackId)
  const deleteMutation = useDeleteTrackMutation(trackId)
  const { t } = useI18n()

  const handleSubmit = async (
    formValues: FormData,
    { setSubmitting }: FormikHelpers<FormData>
  ) => {
    const values: TrackVariables = {
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

    editMutation.mutate(values, {
      onSettled: () => setSubmitting(false),
      onSuccess: () => {
        navigate(`/tracks/${trackId}`)
      },
      onError: error => toast.error(<RequestErrorToast response={error.response} />)
    })
  }

  const handleDelete = async () => {
    const confirmed = confirm(t('tracks.show.delete_confirmation'))

    if (!confirmed) return

    await deleteMutation.mutateAsync()

    navigate(returnTo)
  }

  if (!track) return null

  const fields = {
    ...track,
    missingSuitName: track.missingSuitName || '',
    location: track.location || ''
  }

  return (
    <PageContainer shrinkToContent>
      <Form fields={fields} onSubmit={handleSubmit} onDelete={handleDelete} />
    </PageContainer>
  )
}

export default TrackEdit
