module Events
  module EventTracks
    class PenaltiesController < ApplicationController
      include EventScoped

      before_action :set_event, :authorize_event, :set_event_track

      def show
        respond_to do |format|
          format.js
        end
      end

      def update
        if @event_track.update(penalty_params)
          respond_with_scoreboard
        end
      end

      private

      def respond_with_scoreboard
        create_scoreboard(params[:event_id], @display_raw_results)
        respond_to do |format|
          format.js { render template: 'events/event_tracks/scoreboard_with_highlight' }
        end
      end

      def set_event_track
        @event_track = @event.event_tracks.find(params[:event_track_id])
      end

      def penalty_params
        params.require(:penalty).permit(:penalized, :penalty_size, :penalty_reason)
      end
    end
  end
end
