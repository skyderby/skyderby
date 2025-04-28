class PerformanceCompetitions::OpenScoreboardsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event
  before_action :authorize_event_access!

  def show
    @scoreboard = @event.open_standings
  end
end
