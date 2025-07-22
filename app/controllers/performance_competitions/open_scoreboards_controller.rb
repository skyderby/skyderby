class PerformanceCompetitions::OpenScoreboardsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event
  before_action :authorize_event_access!

  def show
    @wind_cancellation = @event.wind_cancellation && params[:including_wind] != '1'
  end
end
