class Api::V1::PerformanceCompetitions::Results::ValidationsController < Api::ApplicationController
  include Api::PerformanceCompetitionScoped
  include Api::EventManagement
  include PerformanceCompetitionBroadcasts

  def update
    @result = @event.results.find(params[:result_id])

    if @result.update(params.require(:result).permit(:validated))
      broadcast_validation_update_for(@result)
      broadcast_scoreboards
      render 'api/v1/performance_competitions/results/record'
    else
      render_record_errors @result
    end
  end
end
