import React, { useRef, useCallback } from 'react'
import { Field } from 'formik'

import { useI18n } from 'components/TranslationsProvider'
import { videoCodeFromUrl } from 'components/YoutubePlayer/useYoutubeApi'
import YoutubePlayer from 'components/YoutubePlayer'

import styles from './styles.module.scss'

type VideoSetup = {
  setFieldValue: (name: string, value: string | number | undefined | null) => void
  videoId?: string
}

const VideoSetup = ({ setFieldValue, videoId }: VideoSetup): JSX.Element => {
  const { t } = useI18n()
  const playerRef = useRef<{ getPlayerTime(): number | undefined }>()

  const handleUrlChange = useCallback(
    (event: InputEvent) => {
      const target = event.target as HTMLInputElement
      const { value: url } = target
      setFieldValue('url', url)
      setFieldValue('videoId', videoCodeFromUrl(url))
    },
    [setFieldValue]
  )

  const setTimeFromVideo = useCallback(() => {
    if (!playerRef.current) return

    const playerTime = playerRef.current.getPlayerTime()
    if (playerTime === undefined) return
    setFieldValue('videoOffset', Math.round(playerTime * 10) / 10)
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

export default VideoSetup
