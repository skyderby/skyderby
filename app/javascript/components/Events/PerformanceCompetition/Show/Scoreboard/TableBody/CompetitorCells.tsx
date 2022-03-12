import React, { useState } from 'react'

import {
  PerformanceCompetition,
  useCompetitorQuery,
  useDeleteCompetitorMutation,
  useUpdateCompetitorMutation
} from 'api/performanceCompetitions'
import { useProfileQuery } from 'api/profiles'
import { useCountryQuery } from 'api/countries'
import PencilIcon from 'icons/pencil'
import TimesIcon from 'icons/times'
import CompetitorForm from '../CompetitorForm'
import styles from './styles.module.scss'
import SuitLabel from 'components/SuitLabel'
import { useSuitQuery } from 'api/suits'
import { useManufacturerQuery } from 'api/manufacturer'

type CompetitorCellsProps = {
  event: PerformanceCompetition
  competitorId: number
}

const CompetitorCells = ({ event, competitorId }: CompetitorCellsProps): JSX.Element => {
  const [competitorFormShown, setCompetitorFormShown] = useState(false)
  const { data: competitor } = useCompetitorQuery(event.id, competitorId)
  const { data: profile } = useProfileQuery(competitor?.profileId, { enabled: false })
  const { data: country } = useCountryQuery(profile?.countryId)
  const { data: suit } = useSuitQuery(competitor?.suitId)
  const { data: make } = useManufacturerQuery(suit?.makeId)

  const editMutation = useUpdateCompetitorMutation(event.id, competitorId)
  const deleteMutation = useDeleteCompetitorMutation(event.id, competitorId)
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
          <SuitLabel name={suit?.name} code={make?.code} />
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
