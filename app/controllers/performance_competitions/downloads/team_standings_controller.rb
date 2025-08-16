class PerformanceCompetitions::Downloads::TeamStandingsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event, :set_scoreboard
  before_action :authorize_event_update!

  def show
    respond_to do |format|
      format.xml do
        formatted_date = Time.zone.now.to_date.iso8601
        response.headers['Content-Disposition'] =
          "attachment; filename=#{formatted_date} - Teams - #{@event.name.to_param}.xml"
      end
    end
  end

  private

  def set_scoreboard
    @scoreboard = @event.team_standings(wind_cancellation: @event.wind_cancellation)
  end
end
