import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { createTrackSelector, deleteTrack } from 'redux/tracks'
import { useI18n } from 'components/TranslationsProvider'
import { usePageContext } from 'components/PageContext'
import BackLink from 'components/ui/BackLink'
import Form from './Form'
import { PageContainer, FormContainer } from './elements'

const TrackEdit = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { trackId, locationState } = usePageContext()
  const track = useSelector(createTrackSelector(trackId))
  const { t } = useI18n()

  const handleSubmit = console.log

  const handleDelete = async () => {
    const confirmed = confirm(t('tracks.show.delete_confirmation'))

    if (!confirmed) return

    await dispatch(deleteTrack(track.id))

    history.push(locationState?.returnTo || '/tracks')
  }

  const handleCancel = () => {
    history.goBack()
  }

  return (
    <PageContainer>
      <BackLink to={`/tracks/${trackId}`}>{t('general.back')}</BackLink>

      <FormContainer>
        {track?.status === 'loaded' && (
          <Form
            track={track}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            onCancel={handleCancel}
          />
        )}
      </FormContainer>
    </PageContainer>
  )
}

export default TrackEdit
