class SpeedSkydivingCompetitions::DownloadsController < ApplicationController
  include SpeedSkydivingCompetitionScoped

  before_action :set_event
  before_action :authorize_event_update!

  def show; end
end
