module Assets
  module PerformanceCompetitions
    class TeamStandingsController < ApplicationController
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
        @event = Event.speed_distance_time.find(params[:performance_competition_id])
      end

      def set_scoreboard
        scoreboard_params = Events::Scoreboards::Params.new(@event, params)
        @scoreboard = Events::Scoreboards.for(@event, scoreboard_params)
      end
    end
  end
end
