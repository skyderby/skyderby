class PerformanceCompetitions::ReferencePointAssignmentsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event
  before_action :authorize_event_update!

  def create
    round = @event.rounds.find(params[:round_id])
    competitor = @event.competitors.find(params[:competitor_id])
    reference_point = params[:reference_point_id].presence &&
                      @event.reference_points.find(params[:reference_point_id])

    if reference_point.present?
      assignment = round.reference_point_assignments.find_or_initialize_by(competitor:)
      assignment.reference_point = reference_point
      assignment.save!
    else
      round.reference_point_assignments.find_by(competitor:).destroy
    end

    head :ok
  end
end
