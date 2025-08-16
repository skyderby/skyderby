class PerformanceCompetitions::Downloads::OpenEventScoreboardsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event, :set_scoreboard
  before_action :authorize_event_update!

  def show
    respond_to do |format|
      format.xml do
        response.headers['Content-Disposition'] =
          "attachment; filename=open-event-scoreboard-#{@event.name.parameterize}.xml"
      end
    end
  end

  private

  def set_event
    @event = PerformanceCompetition.find(params[:performance_competition_id])
  end

  def set_scoreboard
    @scoreboard = @event.open_standings(wind_cancellation: @event.wind_cancellation)
  end
end
