import React from 'react'
import { useSelector } from 'react-redux'
import { Formik } from 'formik'
import I18n from 'i18n-js'

import { selectTrack } from 'redux/tracks'
import { usePageContext } from 'components/PageContext'
import DefaultButton from 'components/ui/buttons/Default'
import RedButton from 'components/ui/buttons/Red'
import PrimaryButton from 'components/ui/buttons/Primary'

import VideoSetup from './VideoSetup'
import TrackOffset from './TrackOffset'
import { Footer } from './elements'

const TrackVideoForm = () => {
  const { trackId } = usePageContext()
  const track = useSelector(state => selectTrack(state, trackId))

  const handleSubmit = values => console.log(values)

  return (
    <Formik
      initialValues={{ url: '', videoId: '', videoOffset: 0, trackOffset: track.jumpRange.from }}
      onSubmit={handleSubmit}
    >
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
