import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { useEditResultMutation } from 'api/hooks/speedSkydivingCompetitions'
import { useI18n } from 'components/TranslationsProvider'
import Modal from 'components/ui/Modal'
import { useTrackQuery } from 'api/hooks/tracks'
import AltitudeRangeSelect from 'components/AltitudeRangeSelect'
import styles from './styles.module.scss'

const JumpRange = ({ event, result, tabBar, deleteResult, hide }) => {
  const { t } = useI18n()
  const { data: track, isLoading } = useTrackQuery(result.trackId)
  const [selectedRange, setSelectedRange] = useState()
  const editMutation = useEditResultMutation()

  if (isLoading) return null

  const handleSave = async () => {
    if (!selectedRange) return hide()

    try {
      await editMutation.mutateAsync({
        eventId: event.id,
        id: result.id,
        trackAttributes: {
          ffStart: selectedRange.from,
          ffEnd: selectedRange.to
        }
      })

      hide()
    } catch (err) {
      alert(err)
    }
  }

  return (
    <>
      <Modal.Body>
        {tabBar}

        <hr />

        <AltitudeRangeSelect
          trackId={track.id}
          value={track.jumpRange}
          onChange={setSelectedRange}
        />
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

JumpRange.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    permissions: PropTypes.shape({
      canEdit: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired,
  result: PropTypes.shape({
    id: PropTypes.number.isRequired,
    trackId: PropTypes.number.isRequired
  }).isRequired,
  deleteResult: PropTypes.func.isRequired,
  hide: PropTypes.func.isRequired,
  tabBar: PropTypes.object.isRequired
}

export default JumpRange
