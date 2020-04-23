import React, { useRef } from 'react'
import { Formik, Field } from 'formik'

import Input from 'components/ui/Input'
import DefaultButton from 'components/ui/buttons/Default'
import PrimaryButton from 'components/ui/buttons/Primary'
import { videoCodeFromUrl } from 'utils/youtube'
import Player from './Player'
import { Container, Section, Description, Controls, Footer } from './elements'

const TrackVideo = () => {
  const playerRef = useRef()

  const handleSubmit = values => console.log(values)

  return (
    <Container>
      <Formik initialValues={{ url: '', videoId: '', startTime: 0 }} onSubmit={handleSubmit}>
        {({ values, handleSubmit, setFieldValue }) => {
          const handleUrlChange = e => {
            const { value } = e.target

            setFieldValue('url', value)
            setFieldValue('videoId', videoCodeFromUrl(value))
          }

          const setTimeFromVideo = () => {
            setFieldValue('startTime', playerRef.current.getPlayerTime())
          }

          return (
            <form onSubmit={handleSubmit}>
              <Section>
                <Description>
                  <h2>Youtube video</h2>
                </Description>
                <Controls>
                  <Field
                    as={Input}
                    name="url"
                    placeholder="Enter Youtube link here"
                    onChange={handleUrlChange}
                  />
                </Controls>
              </Section>

              <Section>
                <Description>
                  <h2>Start of the jump on video</h2>
                  <p>
                    Play video until jump started, pause the video at the beginning of the
                    jump, then press button 'Set' in the field to paste current time.
                    Value in the field is a seconds from beginning of video.
                  </p>
                </Description>
                <Controls>
                  <Player ref={playerRef} videoId={values.videoId} />
                  <Field as={Input} name='startTime' />
                  <DefaultButton type="button" onClick={setTimeFromVideo}>Set!</DefaultButton>
                </Controls>
              </Section>

              <Section>
                <Description>
                  <h2>Start of the jump on track</h2>
                  <p>
                    Find start of the jump on the chart and click on it. For precious
                    changing use chart zooming feature or buttons in the field. Value in
                    the field is a seconds from when you start recording jump.
                  </p>
                </Description>
                <Controls>
                  <Input />
                </Controls>
              </Section>
              <Footer>
                <DefaultButton type="button">Delete</DefaultButton>
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
