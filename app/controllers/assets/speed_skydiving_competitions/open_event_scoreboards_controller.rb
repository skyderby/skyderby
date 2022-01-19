module Assets
  module SpeedSkydivingCompetitions
    class OpenEventScoreboardsController < ApplicationController
      before_action :set_event

      def show
        authorize @event, :download?

        @scoreboard = SpeedSkydivingCompetition::OpenScoreboard.new(@event)

        respond_to do |format|
          format.xml do
            response.headers['Content-Disposition'] = "attachment; filename=#{filename}.xml"
          end
          format.xlsx do
            response.headers['Content-Disposition'] = "attachment; filename=#{filename}.xlsx"
          end
        end
      end

      private

      def filename
        formatted_date = Time.zone.now.to_date.iso8601
        "#{formatted_date} - #{@event.name.to_param}"
      end

      def set_event
        @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
      end
    end
  end
end
