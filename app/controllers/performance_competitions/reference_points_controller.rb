class PerformanceCompetitions::ReferencePointsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :authorize_event_update!

  def show; end

  def update
    if @event.update(reference_points_params)
      redirect_to @event
    else
      respond_with_errors(@event.errors)
    end
  end

  private

  def reference_points_params
    params.require(:event).permit(:designated_lane_start, reference_points_attributes: {})
  end
end
