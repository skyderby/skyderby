import React from 'react'
import PropTypes from 'prop-types'

import { useCompetitorQuery, useRoundQuery } from 'api/hooks/speedSkydivingCompetitions'
import { useProfileQuery } from 'api/hooks/profiles'
import Modal from 'components/ui/Modal'
import { useI18n } from 'components/TranslationsProvider'
import styles from './styles.module.scss'

const ResultModal = ({ event, result, onHide: hide, deleteResult }) => {
  const { t } = useI18n()
  const { data: competitor } = useCompetitorQuery(event.id, result.competitorId)
  const { data: profile } = useProfileQuery(competitor?.profileId)
  const { data: round } = useRoundQuery(event.id, result.roundId)

  return (
    <Modal
      isShown={true}
      onHide={hide}
      title={`Result: ${profile?.name} - Round ${round?.number}`}
      size="md"
    >
      <Modal.Body>Result: {result.result}</Modal.Body>
      <Modal.Footer>
        {event.permissions.canEdit && (
          <button className={styles.deleteButton} onClick={deleteResult}>
            {t('general.delete')}
          </button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

ResultModal.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    permissions: PropTypes.shape({
      canEdit: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired,
  result: PropTypes.shape({
    id: PropTypes.number.isRequired,
    competitorId: PropTypes.number.isRequired,
    roundId: PropTypes.number.isRequired,
    trackId: PropTypes.number.isRequired,
    result: PropTypes.number
  }).isRequired,
  onHide: PropTypes.func.isRequired,
  deleteResult: PropTypes.func.isRequired
}

export default ResultModal
