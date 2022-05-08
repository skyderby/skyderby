import React from 'react'

import Select from './Select'
import {
  Competitor,
  PerformanceCompetition,
  ReferencePoint as ReferencePointType,
  useReferencePointsQuery,
  useUpdateReferencePointAssignmentMutation
} from 'api/performanceCompetitions'
import LocationIcon from 'icons/location.svg'

import styles from './styles.module.scss'
import { ValueType } from 'react-select'

type ReferencePointProps = {
  event: PerformanceCompetition
  roundId: number
  competitor: Competitor & { referencePoint: ReferencePointType | null }
}

const ReferencePoint = ({ event, roundId, competitor }: ReferencePointProps) => {
  const { data: referencePoints = [] } = useReferencePointsQuery(event.id)
  const mutation = useUpdateReferencePointAssignmentMutation(event.id)

  if (event.permissions.canEdit) {
    const updateAssignment = (referencePointId: number | null) => {
      mutation.mutate({
        roundId,
        competitorId: competitor.id,
        referencePointId
      })
    }

    return (
      <Select
        value={competitor.referencePoint}
        referencePoints={referencePoints}
        onChange={(option: ValueType<{ value: number }, false>) => {
          if (option === null) {
            updateAssignment(null)
          } else {
            updateAssignment(option.value)
          }
        }}
      />
    )
  }

  return competitor.referencePoint ? (
    <div className={styles.readOnly}>
      <LocationIcon />
      {competitor.referencePoint.name}
    </div>
  ) : null
}

export default ReferencePoint
