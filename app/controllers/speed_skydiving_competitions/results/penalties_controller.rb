class SpeedSkydivingCompetitions::Results::PenaltiesController < ApplicationController
  include SpeedSkydivingCompetitionScoped

  before_action :set_event
  before_action :set_result
  before_action :authorize_event_update!

  def show
    @penalties = @result.penalties
  end

  def new; end

  def update
    if @result.update(penalties_params)
      broadcast_scoreboard
    else
      respond_with_errors @result
    end
  end

  private

  def set_result
    @result = @event.results.find(params[:result_id])
  end

  def penalties_params
    params.require(:result).permit(penalties_attributes: [:percent, :reason, :id, :_destroy])
  end
end
