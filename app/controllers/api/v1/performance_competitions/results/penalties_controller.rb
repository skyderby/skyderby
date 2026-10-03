class Api::V1::PerformanceCompetitions::Results::PenaltiesController < Api::ApplicationController
  include Api::PerformanceCompetitionScoped
  include Api::EventManagement
  include PerformanceCompetitionBroadcasts

  def update
    @result = @event.results.find(params[:result_id])

    if @result.update(params.require(:penalty).permit(:penalized, :penalty_size, :penalty_reason))
      broadcast_validation_update_for(@result)
      render 'api/v1/performance_competitions/results/record'
    else
      render_record_errors @result
    end
  end
end
