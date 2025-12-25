class PerformanceCompetitions::ResultsCopiesController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event
  before_action :authorize_event_update!

  def new; end

  def create
    @event.copy_results_from!(PerformanceCompetition.find(copy_params[:source_event_id]))

    respond_with_scoreboard
  end

  private

  def copy_params
    params.require(:result_copy).permit(:source_event_id)
  end
end
