import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Formik } from 'formik'
import I18n from 'i18n-js'

import { createTrackSelector } from 'redux/tracks'
import {
  createTrackVideoSelector,
  saveTrackVideo,
  deleteTrackVideo
} from 'redux/tracks/videos'
import { usePageContext } from 'components/PageContext'
import DefaultButton from 'components/ui/buttons/Default'
import RedButton from 'components/ui/buttons/Red'
import PrimaryButton from 'components/ui/buttons/Primary'

import VideoSetup from './VideoSetup'
import TrackOffset from './TrackOffset'
import { Footer } from './elements'

const TrackVideoForm = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { trackId } = usePageContext()
  const track = useSelector(createTrackSelector(trackId))
  const video = useSelector(createTrackVideoSelector(trackId))

  if (!['loaded', 'noVideo'].includes(video?.status)) return null

  const isNewVideo = video.status === 'noVideo'
  const formValues = isNewVideo
    ? {
        url: '',
        videoId: '',
        videoOffset: 0,
        trackOffset: track.jumpRange.from
      }
    : {
        url: video.url,
        videoId: video.videoCode,
        videoOffset: video.videoOffset,
        trackOffset: video.trackOffset
      }

  const handleSubmit = async values => {
    await dispatch(saveTrackVideo(trackId, values))
    history.push(`/tracks/${trackId}/video`)
  }

  const handleDelete = async () => {
    await dispatch(deleteTrackVideo(trackId))
    history.push(`/tracks/${trackId}`)
  }

  const handleCancel = () => {
    const url = `/tracks/${trackId}${isNewVideo ? '' : '/video'}`
    history.push(url)
  }

  return (
    <Formik initialValues={formValues} onSubmit={handleSubmit}>
      {({ values, handleSubmit, setFieldValue }) => (
        <form onSubmit={handleSubmit}>
          <VideoSetup
            setFieldValue={setFieldValue}
            videoId={values.videoId}
            videoOffset={values.videoOffset}
          />
          <TrackOffset setFieldValue={setFieldValue} value={values.trackOffset} />

          <hr />

          <Footer>
            <RedButton type="button" outlined onClick={handleDelete}>
              {I18n.t('general.delete')}
            </RedButton>

            <div>
              <PrimaryButton type="submit">{I18n.t('general.save')}</PrimaryButton>
              <DefaultButton type="button" onClick={handleCancel}>
                {I18n.t('general.cancel')}
              </DefaultButton>
            </div>
          </Footer>
        </form>
      )}
    </Formik>
  )
}

export default TrackVideoForm
