class SpeedSkydivingCompetitions::Downloads::TeamStandingsController < ApplicationController
  include SpeedSkydivingCompetitionScoped

  before_action :set_event
  before_action :authorize_event_update!

  def show
    @standings = @event.team_standings

    respond_to do |format|
      format.xml do
        formatted_date = Time.zone.now.to_date.iso8601
        response.headers['Content-Disposition'] =
          "attachment; filename=#{@event.name.to_param}_Teams_#{formatted_date}.xml"
      end
    end
  end
end
