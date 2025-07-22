class Api::V1::Events::ScoreboardsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event
  before_action :authorize_event_access!

  def show
    @scoreboard = ::Events::Scoreboards.for(@event, scoreboard_params(@event))

    respond_to do |format|
      format.json
    end
  end

  private

  def set_event
    load_event(params[:event_id])
  end
end
