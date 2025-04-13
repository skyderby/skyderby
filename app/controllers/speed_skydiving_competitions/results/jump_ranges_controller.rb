class SpeedSkydivingCompetitions::Results::JumpRangesController < ApplicationController
  include SpeedSkydivingCompetitionScoped

  before_action :set_event
  before_action :set_result
  before_action :authorize_event_update!

  def show; end

  def update
    @result.transaction do
      @result.track.update!(jump_range_params)
      @result.calculate_result
      @result.save!
    end

    broadcast_scoreboard
  rescue ActiveRecord::RecordInvalid
    respond_with_errors(@result)
  end

  private

  def set_result
    @result = @event.results.find(params[:result_id])
  end

  def jump_range_params
    params.require(:jump_range).permit(:jump_range)
  end
end
