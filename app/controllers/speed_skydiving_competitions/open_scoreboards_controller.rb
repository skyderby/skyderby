class SpeedSkydivingCompetitions::OpenScoreboardsController < ApplicationController
  include SpeedSkydivingCompetitionScoped

  before_action :set_event
  before_action :authorize_event_access!

  def show; end
end
