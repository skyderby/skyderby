class Api::V1::PerformanceCompetitions::ReferencePointAssignmentsController < Api::ApplicationController
  include Api::PerformanceCompetitionScoped
  include Api::EventManagement

  def create
    @round = @event.rounds.find(params.require(:round_id))
    @competitor = @event.competitors.find(params.require(:competitor_id))
    @reference_point = params[:reference_point_id].presence && @event.reference_points.find(params[:reference_point_id])

    if @reference_point
      assignment = @round.reference_point_assignments.find_or_initialize_by(competitor: @competitor)
      return render_record_errors(assignment) unless assignment.update(reference_point: @reference_point)
    else
      @round.reference_point_assignments.find_by(competitor: @competitor)&.destroy
    end

    render :show
  end
end
