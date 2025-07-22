class PerformanceCompetitions::DownloadsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event
  before_action :authorize_event_update!

  def show; end
end
