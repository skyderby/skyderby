import React from 'react'
import { useHistory } from 'react-router-dom'
import { Formik } from 'formik'
import PropTypes from 'prop-types'

import { useTrackQuery } from 'api/hooks/tracks'
import {
  useDeleteVideoMutation,
  useEditVideoMutation,
  useTrackVideoQuery
} from 'api/hooks/tracks/video'
import { useI18n } from 'components/TranslationsProvider'
import PageContainer from 'components/Tracks/Track/PageContainer'
import VideoSetup from './VideoSetup'
import TrackOffset from './TrackOffset'
import styles from './styles.module.scss'

const VideoSettings = ({ trackId }) => {
  const history = useHistory()
  const { t } = useI18n()
  const { data: track } = useTrackQuery(trackId)
  const { data: video, isLoading } = useTrackVideoQuery(trackId, {
    enabled: track?.hasVideo
  })
  const saveMutation = useEditVideoMutation()
  const deleteMutation = useDeleteVideoMutation()

  if (isLoading) return null

  const formValues = track.hasVideo
    ? {
        url: video.url,
        videoId: video.videoCode,
        videoOffset: video.videoOffset,
        trackOffset: video.trackOffset
      }
    : {
        url: '',
        videoId: '',
        videoOffset: 0,
        trackOffset: track.jumpRange.from
      }

  const handleSubmit = async values => {
    await saveMutation.mutateAsync({ id: trackId, changes: values })
    history.push(`/tracks/${trackId}/video`)
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(trackId)
    history.push(`/tracks/${trackId}`)
  }

  const handleCancel = () => {
    const url = `/tracks/${trackId}${track.hasVideo ? '/video' : ''}`
    history.push(url)
  }

  return (
    <PageContainer shrinkToContent>
      <Formik initialValues={formValues} onSubmit={handleSubmit}>
        {({ values, handleSubmit, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <VideoSetup
              setFieldValue={setFieldValue}
              videoId={values.videoId}
              videoOffset={values.videoOffset}
            />
            <TrackOffset
              trackId={trackId}
              setFieldValue={setFieldValue}
              value={values.trackOffset}
            />

            <hr />

            <div className={styles.footer}>
              <button
                className={styles.dangerButton}
                type="button"
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
    </PageContainer>
  )
}

VideoSettings.propTypes = {
  trackId: PropTypes.number.isRequired
}

export default VideoSettings
