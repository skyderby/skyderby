import React, { useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import { Field } from 'formik'

import { videoCodeFromUrl } from 'utils/youtube'

import Player from './Player'
import DefaultButton from 'components/ui/buttons/Default'
import Input from 'components/ui/Input'
import { Section, Description, Controls, ControlsContainer } from './elements'

// const simpleVideoId = () => {
//   return videoCodeFromUrl('https://www.youtube.com/watch?v=zad8bbIWB60')
// }

const VideoSetup = ({ setFieldValue, value }) => {
  // if (!value || value === '') value = simpleVideoId()
  const playerRef = useRef()

  const handleUrlChange = useCallback(
    e => {
      const { value: url } = e.target
      setFieldValue('url', url)
      setFieldValue('videoId', videoCodeFromUrl(url))
    },
    [setFieldValue]
  )

  const setTimeFromVideo = useCallback(() => {
    setFieldValue('startTime', playerRef.current.getPlayerTime())
  }, [setFieldValue])

  const title = 'Start of the jump on video'
  const discription = `Play video until jump started, pause the video at the beginning of the jump,
  then press button "Set!"; in the field to paste current time. Value in
  the field is a seconds from beginning of video.`

  const ControlsBox = () => (
    <ControlsContainer>
      {/* Are these controls really needed? */}
      <Field as={Input} name="startTime" />
      <DefaultButton type="button" onClick={setTimeFromVideo}>
        Set!
      </DefaultButton>
    </ControlsContainer>
  )

  return (
    <>
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
          <h2>{title}</h2>
          <p>{discription}</p>
        </Description>
        <Controls>
          <Player ref={playerRef} videoId={value} setFieldValue={setFieldValue} />
          <ControlsBox />
        </Controls>
      </Section>
    </>
  )
}

VideoSetup.propTypes = {
  setFieldValue: PropTypes.func,
  value: PropTypes.string
}

export default VideoSetup
