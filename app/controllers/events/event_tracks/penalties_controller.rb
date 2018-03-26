module Events
  module EventTracks
    class PenaltiesController < ApplicationController
      include EventTrackScoped, EventScoped

      def show
        respond_to do |format|
          format.js
        end
      end

      def update
        if @event_track.update(penalty_params)
          respond_with_scoreboard
        else
          respond_with_errors(@event_track.errors)
        end
      end

      private

      def penalty_params
        params.require(:penalty).permit(:penalized, :penalty_size, :penalty_reason)
      end
    end
  end
end
