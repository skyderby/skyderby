import React, { useState } from 'react'

import {
  useDeleteCompetitorMutation,
  useUpdateCompetitorMutation,
  Competitor,
  PerformanceCompetition
} from 'api/performanceCompetitions'
import { useProfileQuery } from 'api/profiles'
import { useCountryQuery } from 'api/countries'
import PencilIcon from 'icons/pencil'
import TimesIcon from 'icons/times'
import CompetitorForm from '../CompetitorForm'
import styles from './styles.module.scss'
import SuitLabel from 'components/SuitLabel'

type CompetitorCellsProps = {
  event: PerformanceCompetition
  competitor: Competitor
}

const CompetitorCells = ({ event, competitor }: CompetitorCellsProps): JSX.Element => {
  const [competitorFormShown, setCompetitorFormShown] = useState(false)
  const { data: profile } = useProfileQuery(competitor?.profileId, { enabled: false })
  const { data: country } = useCountryQuery(profile?.countryId)

  const editMutation = useUpdateCompetitorMutation(event.id, competitor.id)
  const deleteMutation = useDeleteCompetitorMutation(event.id, competitor.id)
  const deleteCompetitor = () => deleteMutation.mutate(undefined)

  return (
    <>
      <td className={styles.competitorCell}>
        <div className={styles.competitorMain}>
          <span>{profile?.name}</span>
          {competitor?.assignedNumber && (
            <span className={styles.assignedNumber}>#{competitor.assignedNumber}</span>
          )}
          {event.permissions.canEdit && (
            <div className={styles.actions}>
              <button
                className={styles.actionButton}
                onClick={() => setCompetitorFormShown(true)}
              >
                <PencilIcon />
              </button>
              <button className={styles.actionButton} onClick={deleteCompetitor}>
                <TimesIcon />
              </button>
            </div>
          )}
        </div>
        <div className={styles.competitorAdditional}>
          {competitor?.suitId && <SuitLabel suitId={competitor.suitId} />}
        </div>
      </td>
      <td>{country?.code}</td>

      {competitorFormShown && (
        <CompetitorForm
          eventId={event.id}
          initialValues={competitor}
          mutation={editMutation}
          onHide={() => setCompetitorFormShown(false)}
        />
      )}
    </>
  )
}

export default CompetitorCells
