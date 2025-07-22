class PerformanceCompetitions::DesignatedLaneStartsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event
  before_action :authorize_event_update!

  def update
    if @event.update(dl_params)
      head :ok
    else
      respond_with_errors(@event)
    end
  end

  private

  def dl_params
    params.require(:event).permit(:designated_lane_start)
  end
end
