module Events
  class TeamScoreboardsController < ApplicationController
    include EventScoped

    before_action :set_event, :set_scoreboard

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

    def set_event
      @event = authorize Event.find(params[:event_id])
    end

    def set_scoreboard
      @scoreboard = Events::Scoreboards.for(@event, scoreboard_params(@event))
    end
  end
end
