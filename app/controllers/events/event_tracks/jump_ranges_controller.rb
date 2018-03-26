module Events
  module EventTracks
    class JumpRangesController < ApplicationController
      include EventTrackScoped, EventScoped

      def show
        respond_to do |format|
          format.js
        end
      end

      def update
        @event_track.transaction do
          @event_track.track.update!(jump_range_params)
          @event_track.calc_result
          @event_track.save!
        end

        respond_with_scoreboard
      end

      private

      def jump_range_params
        params.require(:jump_range).permit(:jump_range)
      end
    end
  end
end
