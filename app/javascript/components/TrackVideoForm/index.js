import React from 'react'
import { Formik } from 'formik'
import I18n from 'i18n-js'

import DefaultButton from 'components/ui/buttons/Default'
import RedButton from 'components/ui/buttons/Red'
import PrimaryButton from 'components/ui/buttons/Primary'
import { Footer } from './elements'

import VideoSetup from './VideoSetup'
import TrackOffset from './TrackOffset'

const TrackVideo = () => {
  const handleSubmit = values => console.log(values)

  return (
    <Formik
      initialValues={{ url: '', videoId: '', videoOffset: 0, trackOffset: 0 }}
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

export default TrackVideo
