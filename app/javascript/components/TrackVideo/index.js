import React from 'react'
import { Formik } from 'formik'

import RedButton from 'components/ui/buttons/Red'
import PrimaryButton from 'components/ui/buttons/Primary'
import { Container, Footer } from './elements'

import VideoSetup from './VideoSetup'
import TrackOffset from './TrackOffset'

const TrackVideo = () => {
  const handleSubmit = values => console.log(values)

  return (
    <Container>
      <Formik
        initialValues={{ url: '', videoId: '', startTime: 0, trackOffset: 10 }}
        onSubmit={handleSubmit}
      >
        {({ values, handleSubmit, setFieldValue }) => {
          return (
            <form onSubmit={handleSubmit}>
              <VideoSetup setFieldValue={setFieldValue} value={values.videoId} />
              <TrackOffset setFieldValue={setFieldValue} value={values.trackOffset} />

              <Footer>
                <RedButton type="button" outlined>Delete</RedButton>
                <PrimaryButton type="submit">Save</PrimaryButton>
              </Footer>
            </form>
          )
        }}
      </Formik>
    </Container>
  )
}

export default TrackVideo
