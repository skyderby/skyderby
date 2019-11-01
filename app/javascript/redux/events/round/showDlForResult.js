import getLaneViolation from 'utils/checkLaneViolation'
import { updateDL } from './designatedLane.js'

export const showDlForResult = resultId => {
  return (dispatch, getState) => {
    const {
      eventRound: {
        results,
        referencePoints,
        referencePointAssignments,
        event: { designatedLaneStart }
      }
    } = getState()

    const {
      competitorId,
      afterExitPoint,
      startPoint: enterWindowPoint,
      endPoint: exitWindowPoint,
      points
    } = results.find(el => el.id === resultId)

    const startPoint =
      designatedLaneStart === 'on_10_sec' ? afterExitPoint : enterWindowPoint

    const referencePointAssignment = referencePointAssignments.find(
      el => el.competitorId === competitorId
    )

    if (!referencePointAssignment || !referencePointAssignment.referencePointId) {
      return dispatch(updateDL({ enabled: false }))
    }

    const referencePoint = referencePoints.find(
      el => el.id === referencePointAssignment.referencePointId
    )

    if (!startPoint || !referencePoint) return

    const laneViolation = getLaneViolation(
      points,
      startPoint,
      referencePoint,
      exitWindowPoint
    )

    dispatch(
      updateDL({ enabled: true, startPoint, endPoint: referencePoint, laneViolation })
    )
  }
}
