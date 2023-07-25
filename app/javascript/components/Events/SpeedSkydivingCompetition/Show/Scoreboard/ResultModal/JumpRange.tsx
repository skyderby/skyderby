import React, { useState } from 'react'
import toast from 'react-hot-toast'

import {
  SpeedSkydivingCompetition,
  Result,
  useUpdateResultMutation
} from 'api/speedSkydivingCompetitions'
import { useI18n } from 'components/TranslationsProvider'
import Modal from 'components/ui/Modal'
import { useTrackQuery } from 'api/tracks'
import AltitudeRangeSelect from 'components/AltitudeRangeSelect'
import styles from './styles.module.scss'
import RequestErrorToast from 'components/RequestErrorToast'

type JumpRangeProps = {
  event: SpeedSkydivingCompetition
  result: Result
  tabBar: JSX.Element | null
  deleteResult: () => unknown
  hide: () => void
}

type SelectedRange = { from: number; to: number } | undefined

const JumpRange = ({
  event,
  result,
  tabBar,
  deleteResult,
  hide
}: JumpRangeProps): JSX.Element | null => {
  const { t } = useI18n()
  const { data: track, isLoading } = useTrackQuery(result.trackId)
  const [selectedRange, setSelectedRange] = useState<SelectedRange>()
  const updateMutation = useUpdateResultMutation(event.id, result.id)

  if (isLoading) return null

  const handleSave = async () => {
    if (!selectedRange) return hide()

    updateMutation.mutate(
      {
        trackAttributes: {
          ffStart: selectedRange.from,
          ffEnd: selectedRange.to
        }
      },
      {
        onSuccess: () => hide(),
        onError: error => {
          toast.error(<RequestErrorToast response={error.response} />)
        }
      }
    )
  }

  return (
    <>
      <Modal.Body>
        {tabBar}

        <hr />

        {!isLoading && track && (
          <AltitudeRangeSelect
            trackId={track.id}
            value={track.jumpRange}
            onChange={setSelectedRange}
          />
        )}
      </Modal.Body>
      <Modal.Footer spaceBetween>
        <div>
          {event.permissions.canEdit && (
            <button className={styles.deleteButton} onClick={deleteResult}>
              {t('general.delete')}
            </button>
          )}
        </div>
        <div className={styles.footerRight}>
          {event.permissions.canEdit && (
            <button className={styles.primaryButton} onClick={handleSave}>
              {t('general.save')}
            </button>
          )}
          <button className={styles.defaultButton} onClick={hide}>
            {t('general.back')}
          </button>
        </div>
      </Modal.Footer>
    </>
  )
}

export default JumpRange
