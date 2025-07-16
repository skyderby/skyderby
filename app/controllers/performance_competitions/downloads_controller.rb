class PerformanceCompetitions::DownloadsController < ApplicationController
  include EventScoped

  before_action :set_event
  before_action :authorize_event_update!

  def show; end
end