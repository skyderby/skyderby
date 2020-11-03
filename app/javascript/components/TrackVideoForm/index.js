import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Formik } from 'formik'

import { createTrackSelector } from 'redux/tracks'
import {
  createTrackVideoSelector,
  saveTrackVideo,
  deleteTrackVideo
} from 'redux/tracks/videos'
import { useI18n } from 'components/TranslationsProvider'
import { usePageContext } from 'components/PageContext'

import VideoSetup from './VideoSetup'
import TrackOffset from './TrackOffset'

import styles from './styles.module.scss'

const TrackVideoForm = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { t } = useI18n()
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

          <div className={styles.footer}>
            <button
              className={styles.dangerButton}
              type="button"
              outlined
              onClick={handleDelete}
            >
              {t('general.delete')}
            </button>

            <div>
              <button className={styles.primaryButton} type="submit">
                {t('general.save')}
              </button>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={handleCancel}
              >
                {t('general.cancel')}
              </button>
            </div>
          </div>
        </form>
      )}
    </Formik>
  )
}

export default TrackVideoForm
