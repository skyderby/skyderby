class Api::V1::Events::Results::PenaltiesController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event
  before_action :authorize_event_update!

  def update
    @result = @event.results.find(params[:result_id])

    head :ok if @result.update!(penalty_params)
  end

  private

  def set_event
    @event = PerformanceCompetition.find(params[:event_id])
  end

  def penalty_params
    params.require(:penalty).permit(:penalized, :penalty_size, :penalty_reason)
  end
end
