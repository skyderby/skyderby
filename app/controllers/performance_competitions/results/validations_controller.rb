class PerformanceCompetitions::Results::ValidationsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event
  before_action :authorize_event_update!

  def update
    @result = @event.results.find(params[:result_id])

    if @result.update(validation_params)
      broadcast_validation_update_for(@result)
      broadcast_scoreboards
    end
  end

  private

  def validation_params = params.require(:result).permit(:validated)
end
