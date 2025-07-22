class Api::V1::Events::ReferencePointsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event
  before_action :authorize_event_access!

  def index
    @reference_points = @event.reference_points
  end

  private

  def set_event
    @event = PerformanceCompetition.find(params[:event_id])
  end
end
