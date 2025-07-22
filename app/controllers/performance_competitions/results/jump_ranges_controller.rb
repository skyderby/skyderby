class PerformanceCompetitions::Results::JumpRangesController < ApplicationController
  include EventTrackScoped, PerformanceCompetitionScoped

  def show; end

  def update
    @result.transaction do
      @result.track.update!(jump_range_params)
      @result.calc_result
      @result.save!
    end

    respond_with_scoreboard
  rescue ActiveRecord::RecordInvalid
    respond_with_errors @result
  end

  private

  def jump_range_params
    params.require(:jump_range).permit(:jump_range)
  end
end
