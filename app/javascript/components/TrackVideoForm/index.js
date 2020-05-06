import React from 'react'
import { useSelector } from 'react-redux'
import { Formik } from 'formik'
import I18n from 'i18n-js'

import { createTrackSelector } from 'redux/tracks'
import { createTrackVideoSelector } from 'redux/tracks/videos'
import { usePageContext } from 'components/PageContext'
import DefaultButton from 'components/ui/buttons/Default'
import RedButton from 'components/ui/buttons/Red'
import PrimaryButton from 'components/ui/buttons/Primary'

import VideoSetup from './VideoSetup'
import TrackOffset from './TrackOffset'
import { Footer } from './elements'

const TrackVideoForm = () => {
  const { trackId } = usePageContext()
  const track = useSelector(createTrackSelector(trackId))
  const video = useSelector(createTrackVideoSelector(trackId))

  if (!['loaded', 'noVideo'].includes(video?.status)) return null

  const formValues =
    video.status === 'noVideo'
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

  const handleSubmit = values => console.log(values)

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
            <RedButton type="button" outlined>
              {I18n.t('general.delete')}
            </RedButton>

            <div>
              <PrimaryButton type="submit">{I18n.t('general.save')}</PrimaryButton>
              <DefaultButton type="button">{I18n.t('general.cancel')}</DefaultButton>
            </div>
          </Footer>
        </form>
      )}
    </Formik>
  )
}

export default TrackVideoForm
