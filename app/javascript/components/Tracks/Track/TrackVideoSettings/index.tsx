import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Formik } from 'formik'

import { useTrackQuery } from 'api/tracks'
import {
  useDeleteVideoMutation,
  useEditVideoMutation,
  useTrackVideoQuery,
  VideoRecord
} from 'api/tracks/video'
import { useI18n } from 'components/TranslationsProvider'
import PageContainer from 'components/Tracks/Track/PageContainer'
import VideoSetup from './VideoSetup'
import TrackOffset from './TrackOffset'
import styles from './styles.module.scss'

type FormData = Omit<VideoRecord, 'trackId'>

type TrackVideoSettingsProps = {
  trackId: number
}

const TrackVideoSettings = ({ trackId }: TrackVideoSettingsProps): JSX.Element | null => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { data: track, isLoading: trackIsLoading } = useTrackQuery(trackId)
  const { data: video, isLoading: videoIsLoading } = useTrackVideoQuery(trackId, {
    enabled: track?.hasVideo
  })
  const saveMutation = useEditVideoMutation({
    onSuccess: () => navigate(`/tracks/${trackId}/video`)
  })
  const deleteMutation = useDeleteVideoMutation({
    onSuccess: () => navigate(`/tracks/${trackId}`)
  })

  if (videoIsLoading || trackIsLoading) return null

  const formValues = track?.hasVideo
    ? {
        url: video?.url ?? '',
        videoCode: video?.videoCode ?? '',
        videoOffset: video?.videoOffset ?? 0,
        trackOffset: video?.trackOffset ?? 0
      }
    : {
        url: '',
        videoCode: '',
        videoOffset: 0,
        trackOffset: track?.jumpRange.from ?? 0
      }

  const handleSubmit = (values: FormData): void =>
    saveMutation.mutate({ id: trackId, changes: values })

  const handleDelete = () => deleteMutation.mutate(trackId)

  const handleCancel = () =>
    navigate(`/tracks/${trackId}${track?.hasVideo ? '/video' : ''}`)

  return (
    <PageContainer shrinkToContent>
      <Formik initialValues={formValues} onSubmit={handleSubmit}>
        {({ values, handleSubmit, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <VideoSetup setFieldValue={setFieldValue} videoId={values.videoCode} />
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

export default TrackVideoSettings
