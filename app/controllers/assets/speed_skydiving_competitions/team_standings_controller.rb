module Assets
  module SpeedSkydivingCompetitions
    class TeamStandingsController < ApplicationController
      before_action :set_event

      def show
        authorize @event, :download?

        @standings = SpeedSkydivingCompetition::TeamStandings.new(@event)

        respond_to do |format|
          format.xml do
            formatted_date = Time.zone.now.to_date.iso8601
            response.headers['Content-Disposition'] =
              "attachment; filename=#{@event.name.to_param}_Teams_#{formatted_date}.xml"
          end
        end
      end

      private

      def set_event
        @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
      end
    end
  end
end
