class PerformanceCompetitions::Results::PenaltiesController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_result, :authorize_event_update!

  def show; end

  def update
    if @result.update(penalty_params)
      broadcast_scoreboard
    else
      respond_with_errors(@result)
    end
  end

  private

  def set_result
    @result = @event.results.find(params[:result_id])
  end

  def penalty_params
    params.require(:penalty).permit(:penalized, :penalty_size, :penalty_reason)
  end
end
