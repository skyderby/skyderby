import React from 'react'
import { useSelector } from 'react-redux'

import { selectTrack } from 'redux/tracks'
import { usePageContext } from 'components/PageContext'
import BackLink from 'components/ui/BackLink'
import Form from './Form'
import { PageContainer, FormContainer } from './elements'

const TrackEdit = () => {
  const { trackId } = usePageContext()
  const track = useSelector(state => selectTrack(state, trackId))

  return (
    <PageContainer>
      <BackLink to={`/tracks/${trackId}`}>{I18n.t('general.back')}</BackLink>

      <FormContainer>
        {track?.status === 'loaded' && <Form track={track} />}
      </FormContainer>
    </PageContainer>
  )
}

export default TrackEdit
