class PerformanceCompetitions::Downloads::TeamStandingsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event
  before_action :authorize_event_update!
  before_action :set_scoreboard

  def show
    @team_ranking = Event::TeamStandings.new(@event, @scoreboard)

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
    @scoreboard = Events::Scoreboards.for(@event, scoreboard_params(@event))
  end
end
