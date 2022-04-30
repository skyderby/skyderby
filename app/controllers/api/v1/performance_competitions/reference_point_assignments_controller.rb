class Api::V1::PerformanceCompetitions::ReferencePointAssignmentsController < Api::ApplicationController
  def index
    event = Event.speed_distance_time.find(params[:performance_competition_id])

    authorize event, :show?

    @assignments = event.reference_point_assignments
  end

  def create
    event = Event.speed_distance_time.find(params[:performance_competition_id])

    authorize event, :update?

    @assignment = event.reference_point_assignments.find_or_initialize_by(
      round_id: assignment_params[:round_id],
      competitor_id: assignment_params[:competitor_id]
    )

    assignment_params[:reference_point_id]
      .then { |id| id.present? ? @assignment.update(reference_point_id: id) : @assignment.destroy }
      .then { |completed| completed ? render : respond_with_errors(@assignment.errors) }
  end

  private

  def assignment_params
    params.require(:reference_point_assignment).permit(:round_id, :competitor_id, :reference_point_id)
  end
end
