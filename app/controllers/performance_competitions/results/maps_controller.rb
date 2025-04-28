class PerformanceCompetitions::Results::MapsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_result

  def show
    authorize_event_access!

    @map_data = Events::Maps::CompetitorTrack.new(@result)
  end

  private

  def set_result
    @result = @event.results.find(params[:result_id])
  end
end
