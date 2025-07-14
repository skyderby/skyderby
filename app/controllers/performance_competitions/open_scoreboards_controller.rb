class PerformanceCompetitions::OpenScoreboardsController < ApplicationController
  include EventScoped

  before_action :set_event
  before_action :authorize_event_access!

  def show; end
end
