class PerformanceCompetitions::TeamsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :authorize_event_access!

  def show; end
end
