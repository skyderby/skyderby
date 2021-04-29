import React, { useRef, useCallback } from 'react'
import { Field } from 'formik'
import PropTypes from 'prop-types'

import { videoCodeFromUrl } from 'utils/youtube'

import { useI18n } from 'components/TranslationsProvider'
import YoutubePlayer from 'components/YoutubePlayer'

import styles from './styles.module.scss'

const VideoSetup = ({ setFieldValue, videoId }) => {
  const { t } = useI18n()
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
  }, [setFieldValue])

  return (
    <>
      <div className={styles.section}>
        <div className={styles.description}>
          <h2>{t('activerecord.attributes.track_videos.url')}</h2>
        </div>
        <div className={styles.controls}>
          <Field
            className={styles.input}
            name="url"
            placeholder="Enter Youtube link here"
            onChange={handleUrlChange}
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.description}>
          <h2>{t('activerecord.attributes.track_videos.video_offset')}</h2>
          <p>{t('tracks.videos.form.video_offset_description')}</p>
        </div>

        <div className={styles.controls}>
          <YoutubePlayer ref={playerRef} videoId={videoId} onPause={setTimeFromVideo} />
          <div className={styles.inputContainer}>
            <Field
              className={styles.input}
              type="number"
              step="0.1"
              min="0"
              name="videoOffset"
            />
          </div>
        </div>
      </div>
    </>
  )
}

VideoSetup.propTypes = {
  setFieldValue: PropTypes.func,
  videoId: PropTypes.string
}

export default VideoSetup
