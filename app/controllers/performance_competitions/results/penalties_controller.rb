class PerformanceCompetitions::Results::PenaltiesController < ApplicationController
  include EventTrackScoped, PerformanceCompetitionScoped

  def show; end

  def update
    if @result.update(penalty_params)
      respond_with_scoreboard
      broadcast_validation_update_for(@result)
    else
      respond_with_errors @result
    end
  end

  private

  def penalty_params
    params.require(:penalty).permit(:penalized, :penalty_size, :penalty_reason)
  end
end
