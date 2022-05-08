class Api::V1::PerformanceCompetitions::Results::PenaltiesController < Api::ApplicationController
  before_action :set_event

  def update
    authorize @event, :update?

    @result = @event.results.find(params[:result_id])

    if @result.update(penalty_params)
      render
    else
      respond_with_errors(@result.errors)
    end
  end

  private

  def set_event
    @event = Event.speed_distance_time.find(params[:performance_competition_id])
  end

  def penalty_params
    params.require(:penalty).permit(:penalized, :penalty_size, :penalty_reason)
  end
end
