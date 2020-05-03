import React, { useRef, useCallback } from 'react'
import { Field } from 'formik'
import I18n from 'i18n-js'
import PropTypes from 'prop-types'

import { videoCodeFromUrl } from 'utils/youtube'

import Player from './Player'
import DefaultButton from 'components/ui/buttons/Default'
import Input from 'components/ui/Input'
import { Section, Description, Controls, ControlsContainer } from './elements'

const VideoSetup = ({ setFieldValue, videoId }) => {
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
    const currentTime = Math.round(playerRef.current.getPlayerTime() * 10) / 10
    if (!Number.isNaN(currentTime)) setFieldValue('videoOffset', currentTime)

    ga('send', 'event', 'trackVideo/edit', 'videoOffset/change')
  }, [setFieldValue])

  return (
    <>
      <Section>
        <Description>
          <h2>{I18n.t('activerecord.attributes.track_videos.url')}</h2>
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
          <h2>{I18n.t('activerecord.attributes.track_videos.video_offset')}</h2>
          <p>{I18n.t('tracks.videos.form.video_offset_description')}</p>
        </Description>

        <Controls>
          <Player ref={playerRef} videoId={videoId} onPause={setTimeFromVideo}/>
          <ControlsContainer>
            <Field as={Input} type="number" step="0.1" min="0" name="videoOffset" />
            <DefaultButton type="button" onClick={setTimeFromVideo}>
              {I18n.t('tracks.videos.form.set')}
            </DefaultButton>
          </ControlsContainer>
        </Controls>
      </Section>
    </>
  )
}

VideoSetup.propTypes = {
  setFieldValue: PropTypes.func,
  videoId: PropTypes.string
}

export default VideoSetup
